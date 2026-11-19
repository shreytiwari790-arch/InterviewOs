import { Interview } from '../models/Interview.js';
import { InterviewReport } from '../models/InterviewReport.js';
import { Question } from '../models/Question.js';
import { Response } from '../models/Response.js';
import {
  ANSWER_EVALUATION_SYSTEM,
  answerEvaluationSchema,
  buildAnswerEvaluationInput,
} from '../prompts/answerEvaluationPrompt.js';
import { REPORT_SYSTEM, buildReportInput, reportNarrativeSchema } from '../prompts/reportPrompt.js';
import { AppError } from '../utils/AppError.js';
import { aiClient } from './aiClient.js';

const ANSWER_KEY_FIELDS = '+correctOptionIds +modelAnswer +expectedKeyConcepts +rubric';
const CRITERIA_WEIGHTS = { correctness: 0.4, relevance: 0.2, completeness: 0.25, clarity: 0.15 };
const EVALUATION_BATCH_SIZE = 8;

const clampScore = (value) => Math.min(10, Math.max(0, Math.round(Number(value) || 0)));
const roundHalf = (value) => Math.round(value * 2) / 2;
const percent = (score, max) => (max > 0 ? Math.round((score / max) * 100) : 0);

/**
 * Deterministic MCQ scoring. Single choice is all-or-nothing. Multi-select gives partial credit:
 * (correct picks − wrong picks) / number of correct options, never below zero.
 */
export function scoreChoiceAnswer(question, selectedOptionIds) {
  const correct = new Set(question.correctOptionIds);
  const selected = new Set(selectedOptionIds);
  const isCorrect = correct.size === selected.size && [...correct].every((id) => selected.has(id));

  if (question.type === 'single_choice' || isCorrect) {
    return { score: isCorrect ? question.marks : 0, isCorrect };
  }
  const hits = [...selected].filter((id) => correct.has(id)).length;
  const misses = selected.size - hits;
  return { score: roundHalf(Math.max(0, (hits - misses) / correct.size) * question.marks), isCorrect: false };
}

export function weightedWrittenScore(criteria, marks) {
  const weighted = Object.entries(CRITERIA_WEIGHTS).reduce((sum, [key, weight]) => sum + criteria[key] * weight, 0);
  return roundHalf((weighted / 10) * marks);
}

async function evaluateWrittenAnswers(items) {
  const evaluations = new Map();
  for (let start = 0; start < items.length; start += EVALUATION_BATCH_SIZE) {
    const batch = items.slice(start, start + EVALUATION_BATCH_SIZE);
    const output = await aiClient.generateStructured({
      schema: answerEvaluationSchema,
      schemaName: 'answer_evaluation',
      system: ANSWER_EVALUATION_SYSTEM,
      user: buildAnswerEvaluationInput(batch),
    });
    for (const evaluation of output.evaluations) evaluations.set(evaluation.questionId, evaluation);
  }

  const missing = items.filter((item) => !evaluations.has(item.questionId));
  if (missing.length) throw new AppError(502, 'Some answers could not be evaluated. Please try again.');
  return evaluations;
}

function summariseScores(rows, key) {
  const totals = new Map();
  for (const row of rows) {
    const entry = totals.get(row[key]) ?? { score: 0, max: 0 };
    totals.set(row[key], { score: entry.score + row.score, max: entry.max + row.maxScore });
  }
  return [...totals].map(([name, { score, max }]) => ({ [key]: name, score: percent(score, max) }));
}

export async function evaluateInterview(interviewId) {
  const interview = await Interview.findById(interviewId);
  if (!interview || interview.status !== 'evaluating') return;

  try {
    const questions = await Question.find({ interview: interview._id }).select(ANSWER_KEY_FIELDS).sort({ order: 1 });
    const responses = await Response.find({ interview: interview._id });
    const responseByQuestion = new Map(responses.map((response) => [response.question.toString(), response]));

    const results = new Map();
    const writtenItems = [];

    for (const question of questions) {
      const response = responseByQuestion.get(question.id);
      const base = { maxScore: question.marks, category: question.category, topic: question.topic };

      if (question.type === 'single_choice' || question.type === 'multi_select') {
        const selected = response?.selectedOptionIds ?? [];
        const { score, isCorrect } = scoreChoiceAnswer(question, selected);
        results.set(question.id, {
          ...base,
          score,
          isCorrect,
          feedback:
            selected.length === 0
              ? 'No option was selected.'
              : isCorrect
                ? 'Correct.'
                : 'Not quite. Review the explanation below.',
        });
      } else if (!response?.answerText?.trim()) {
        results.set(question.id, {
          ...base,
          score: 0,
          feedback: 'No answer was submitted.',
          missedConcepts: question.expectedKeyConcepts,
        });
      } else {
        writtenItems.push({
          questionId: question.id,
          category: question.category,
          topic: question.topic,
          prompt: question.prompt,
          codeSnippet: question.codeSnippet,
          modelAnswer: question.modelAnswer,
          expectedKeyConcepts: question.expectedKeyConcepts,
          rubric: question.rubric,
          answerText: response.answerText,
        });
      }
    }

    const evaluations = writtenItems.length ? await evaluateWrittenAnswers(writtenItems) : new Map();
    for (const item of writtenItems) {
      const evaluation = evaluations.get(item.questionId);
      const question = questions.find((q) => q.id === item.questionId);
      const criteriaScores = Object.fromEntries(
        Object.keys(CRITERIA_WEIGHTS).map((key) => [key, clampScore(evaluation[key])]),
      );
      results.set(item.questionId, {
        maxScore: question.marks,
        category: question.category,
        topic: question.topic,
        score: weightedWrittenScore(criteriaScores, question.marks),
        criteriaScores,
        feedback: evaluation.feedback,
        missedConcepts: evaluation.missedConcepts.slice(0, 6),
      });
    }

    const rows = questions.map((question) => results.get(question.id));
    const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
    const totalMax = rows.reduce((sum, row) => sum + row.maxScore, 0);
    const overallScore = percent(totalScore, totalMax);
    const categoryScores = summariseScores(rows, 'category');
    const topicScores = summariseScores(rows, 'topic');

    const narrative = await aiClient.generateStructured({
      schema: reportNarrativeSchema,
      schemaName: 'interview_report',
      system: REPORT_SYSTEM,
      user: buildReportInput({
        companyName: interview.company.name,
        roleName: interview.role.name,
        overallScore,
        categoryScores,
        topicScores,
        answerNotes: questions.map((question) => {
          const row = results.get(question.id);
          return {
            topic: question.topic,
            scorePercent: percent(row.score, row.maxScore),
            missedConcepts: row.missedConcepts ?? [],
          };
        }),
      }),
    });

    await Response.bulkWrite(
      questions.map((question) => {
        const { category, topic, ...evaluation } = results.get(question.id);
        return {
          updateOne: {
            filter: { interview: interview._id, question: question._id },
            update: { $set: evaluation, $setOnInsert: { user: interview.user } },
            upsert: true,
          },
        };
      }),
    );

    await InterviewReport.findOneAndUpdate(
      { interview: interview._id },
      {
        user: interview.user,
        overallScore,
        categoryScores,
        topicScores,
        strengths: narrative.strengths.slice(0, 5),
        weakTopics: narrative.weakTopics.slice(0, 6),
        recommendations: narrative.recommendations.slice(0, 6),
        summary: narrative.summary,
      },
      { upsert: true },
    );

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.overallScore = overallScore;
    interview.failedStage = undefined;
    interview.failureReason = undefined;
  } catch (error) {
    interview.status = 'failed';
    interview.failedStage = 'evaluation';
    interview.failureReason = error instanceof AppError ? error.message : 'Evaluation failed. Please try again.';
    if (!(error instanceof AppError)) console.error('[interview] evaluation error:', error);
  }
  await interview.save();
}
