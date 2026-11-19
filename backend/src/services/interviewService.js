import { Interview } from '../models/Interview.js';
import { InterviewReport } from '../models/InterviewReport.js';
import { Question } from '../models/Question.js';
import { Response } from '../models/Response.js';
import { AppError } from '../utils/AppError.js';
import { runInBackground } from '../utils/runInBackground.js';
import { getActiveBlueprint } from './companyService.js';
import { evaluateInterview } from './evaluationService.js';
import { getIntegritySummary } from './integrityService.js';
import { buildCategoryPlan, generateQuestions } from './interviewGenerationService.js';
import { getLatestProfile } from './resumeService.js';

const STALE_GENERATION_MS = 10 * 60 * 1000; // A generation running this long was interrupted (e.g. server restart).
const ANSWER_GRACE_MS = 30 * 1000; // Allows for network latency on the last autosave.
const HISTORY_LIMIT = 50;

const CANDIDATE_QUESTION_FIELDS = 'order category topic difficulty type prompt codeSnippet codeLanguage options marks';

const toCandidateQuestion = (question) => ({
  id: question.id,
  order: question.order,
  category: question.category,
  topic: question.topic,
  difficulty: question.difficulty,
  type: question.type,
  prompt: question.prompt,
  codeSnippet: question.codeSnippet,
  codeLanguage: question.codeLanguage,
  options: question.options,
  marks: question.marks,
});

const toCandidateResponse = (response) => ({
  questionId: response.question.toString(),
  answerText: response.answerText,
  selectedOptionIds: response.selectedOptionIds,
  submittedAt: response.submittedAt,
});

async function findOwnedInterview(userId, interviewId) {
  const interview = await Interview.findOne({ _id: interviewId, user: userId });
  if (!interview) throw new AppError(404, 'Interview not found');
  return interview;
}

/** Marks the interview as submitted and starts evaluation once that status is saved. */
async function beginEvaluation(interview) {
  interview.status = 'evaluating';
  interview.submittedAt ??= new Date();
  await interview.save();
  runInBackground(`evaluation ${interview.id}`, () => evaluateInterview(interview.id));
}

/** Applies time-based transitions: interrupted generations fail and expired sessions are submitted. */
async function applyTimeRules(interview) {
  const now = Date.now();
  if (interview.status === 'generating' && now - interview.createdAt.getTime() > STALE_GENERATION_MS) {
    interview.status = 'failed';
    interview.failedStage = 'generation';
    interview.failureReason = 'Generation was interrupted. Please try again.';
    await interview.save();
  } else if (interview.status === 'in_progress' && now > interview.expiresAt.getTime() + ANSWER_GRACE_MS) {
    await beginEvaluation(interview);
  }
  return interview;
}

export async function createInterview(userId, input) {
  if (await Interview.exists({ user: userId, status: 'generating' })) {
    throw new AppError(409, 'An interview is already being prepared. Please wait for it to finish.');
  }

  const blueprint = await getActiveBlueprint(input.blueprintId);
  const profile = await getLatestProfile(userId);

  const config = {
    experienceLevel: input.experienceLevel ?? blueprint.experienceLevel,
    difficulty: input.difficulty ?? blueprint.difficulty,
    durationMinutes: input.durationMinutes ?? blueprint.durationMinutes,
    totalQuestions: input.totalQuestions ?? blueprint.totalQuestions,
  };

  const interview = await Interview.create({
    user: userId,
    blueprint: blueprint._id,
    candidateProfile: profile?._id,
    company: { name: blueprint.company.name, slug: blueprint.company.slug },
    role: { name: blueprint.roleName, track: blueprint.track },
    blueprintSnapshot: {
      companyName: blueprint.company.name,
      roleName: blueprint.roleName,
      track: blueprint.track,
      topics: blueprint.topics,
      focusNotes: blueprint.focusNotes,
      questionTypes: blueprint.questionTypes,
      categoryDistribution: blueprint.categoryDistribution,
    },
    config,
    categoryPlan: buildCategoryPlan(blueprint.categoryDistribution, config.totalQuestions, {
      hasProfile: Boolean(profile),
    }),
  });

  runInBackground(`generation ${interview.id}`, () => generateQuestions(interview.id));
  return interview;
}

export async function listInterviews(userId) {
  return Interview.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .select('company role config status overallScore questionCount createdAt startedAt completedAt failedStage');
}

/** Everything the interview room needs. Never includes answer keys. */
export async function getInterviewSession(userId, interviewId) {
  const interview = await applyTimeRules(await findOwnedInterview(userId, interviewId));
  const isActive = ['ready', 'in_progress'].includes(interview.status);

  const [questions, responses] = isActive
    ? await Promise.all([
        Question.find({ interview: interview._id }).select(CANDIDATE_QUESTION_FIELDS).sort({ order: 1 }),
        Response.find({ interview: interview._id }).select('question answerText selectedOptionIds submittedAt'),
      ])
    : [[], []];

  return {
    interview,
    questions: questions.map(toCandidateQuestion),
    responses: responses.map(toCandidateResponse),
    serverTime: new Date(),
  };
}

export async function startInterview(userId, interviewId) {
  const interview = await findOwnedInterview(userId, interviewId);
  if (interview.status === 'in_progress') return interview;
  if (interview.status !== 'ready') throw new AppError(409, 'This interview cannot be started');

  const now = new Date();
  interview.status = 'in_progress';
  interview.startedAt = now;
  interview.expiresAt = new Date(now.getTime() + interview.config.durationMinutes * 60 * 1000);
  await interview.save();
  return interview;
}

export async function saveAnswer(userId, interviewId, questionId, { answerText, selectedOptionIds, submit }) {
  const interview = await applyTimeRules(await findOwnedInterview(userId, interviewId));
  if (interview.status !== 'in_progress') {
    throw new AppError(
      409,
      interview.status === 'evaluating'
        ? 'Time is up. Your answers have been submitted.'
        : 'This interview is not in progress',
    );
  }

  const question = await Question.findOne({ _id: questionId, interview: interview._id });
  if (!question) throw new AppError(404, 'Question not found in this interview');

  const isChoice = question.type === 'single_choice' || question.type === 'multi_select';
  const validIds = new Set(question.options.map((option) => option.id));
  const selected = isChoice ? [...new Set(selectedOptionIds)].filter((id) => validIds.has(id)) : [];
  if (question.type === 'single_choice' && selected.length > 1) throw new AppError(400, 'Select only one option');

  const existing = await Response.findOne({ interview: interview._id, question: question._id });
  if (existing?.submittedAt) throw new AppError(409, 'This answer has already been submitted');

  const response = await Response.findOneAndUpdate(
    { interview: interview._id, question: question._id },
    {
      user: userId,
      answerText: isChoice ? '' : answerText,
      selectedOptionIds: selected,
      ...(submit && { submittedAt: new Date() }),
    },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
  return toCandidateResponse(response);
}

export async function finishInterview(userId, interviewId) {
  const interview = await findOwnedInterview(userId, interviewId);
  if (interview.status === 'evaluating' || interview.status === 'completed') return interview;
  if (interview.status !== 'in_progress') throw new AppError(409, 'Only an interview in progress can be finished');

  await beginEvaluation(interview);
  return interview;
}

export async function retryInterview(userId, interviewId) {
  const interview = await findOwnedInterview(userId, interviewId);
  if (interview.status !== 'failed') throw new AppError(409, 'Only a failed interview can be retried');

  interview.failureReason = undefined;
  if (interview.failedStage === 'evaluation') {
    await beginEvaluation(interview);
  } else {
    interview.status = 'generating';
    interview.createdAt = new Date(); // Restart the stale-generation clock.
    await interview.save();
    runInBackground(`generation ${interview.id}`, () => generateQuestions(interview.id));
  }
  return interview;
}

/** Full results, including answer keys, available only after the interview is completed. */
export async function getInterviewReport(userId, interviewId) {
  const interview = await findOwnedInterview(userId, interviewId);
  if (interview.status !== 'completed') throw new AppError(409, 'The report is available once evaluation is complete');

  const [report, questions, responses, integrity] = await Promise.all([
    InterviewReport.findOne({ interview: interview._id }),
    Question.find({ interview: interview._id })
      .select('+correctOptionIds +modelAnswer +explanation +followUpQuestions')
      .sort({ order: 1 }),
    Response.find({ interview: interview._id }),
    getIntegritySummary(interview._id),
  ]);
  const responseByQuestion = new Map(responses.map((response) => [response.question.toString(), response]));

  return {
    interview,
    integrity, // Reported separately; never affects the score.
    report: report && {
      overallScore: report.overallScore,
      categoryScores: report.categoryScores,
      topicScores: report.topicScores,
      strengths: report.strengths,
      weakTopics: report.weakTopics,
      recommendations: report.recommendations,
      summary: report.summary,
    },
    answers: questions.map((question) => {
      const response = responseByQuestion.get(question.id);
      return {
        ...toCandidateQuestion(question),
        correctOptionIds: question.correctOptionIds,
        modelAnswer: question.modelAnswer,
        explanation: question.explanation,
        followUpQuestions: question.followUpQuestions,
        answerText: response?.answerText ?? '',
        selectedOptionIds: response?.selectedOptionIds ?? [],
        score: response?.score ?? 0,
        maxScore: response?.maxScore ?? question.marks,
        isCorrect: response?.isCorrect,
        feedback: response?.feedback,
        missedConcepts: response?.missedConcepts ?? [],
        criteriaScores: response?.criteriaScores,
      };
    }),
  };
}
