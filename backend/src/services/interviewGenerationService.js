import { BankQuestion } from '../models/BankQuestion.js';
import { CandidateProfile } from '../models/CandidateProfile.js';
import { Interview } from '../models/Interview.js';
import { Question } from '../models/Question.js';
import {
  INTERVIEW_GENERATION_SYSTEM,
  buildInterviewGenerationInput,
  generatedInterviewSchema,
} from '../prompts/interviewGenerationPrompt.js';
import { AppError } from '../utils/AppError.js';
import { aiClient } from './aiClient.js';

const CHOICE_TYPES = new Set(['single_choice', 'multi_select']);
const MARKS_BY_TYPE = { single_choice: 2, multi_select: 3, short_answer: 5, long_answer: 10 };
const MIN_USABLE_SHARE = 0.7; // Accept the interview if at least 70% of requested questions are valid.
const BANK_SHARE = 0.3; // Up to 30% of each category can come from the admin question bank.

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fromBankQuestion(bankQuestion) {
  return {
    category: bankQuestion.category,
    topic: bankQuestion.topic,
    difficulty: bankQuestion.difficulty,
    type: bankQuestion.type,
    prompt: bankQuestion.prompt,
    codeSnippet: bankQuestion.codeSnippet || undefined,
    codeLanguage: bankQuestion.codeLanguage || undefined,
    options: bankQuestion.options,
    correctOptionIds: bankQuestion.correctOptionIds,
    marks: MARKS_BY_TYPE[bankQuestion.type],
    modelAnswer: bankQuestion.modelAnswer ?? '',
    explanation: bankQuestion.explanation ?? '',
    expectedKeyConcepts: bankQuestion.expectedKeyConcepts,
    rubric: [{ criterion: 'Accuracy and completeness', description: 'Covers the expected key concepts correctly' }],
    followUpQuestions: [],
    source: 'bank',
  };
}

/** Picks bank questions per category and returns what is left for the AI to write. */
async function splitPlanWithBank(interview, allowedTypes) {
  const bank = interview.blueprint
    ? await BankQuestion.find({ blueprint: interview.blueprint, isActive: true, type: { $in: allowedTypes } })
    : [];
  const picked = new Map();
  const aiPlan = [];
  for (const { category, count } of interview.categoryPlan) {
    const pool = shuffle(bank.filter((question) => question.category === category));
    const chosen = pool.slice(0, Math.min(pool.length, Math.floor(count * BANK_SHARE)));
    picked.set(category, chosen.map(fromBankQuestion));
    if (count - chosen.length > 0) aiPlan.push({ category, count: count - chosen.length });
  }
  return { picked, aiPlan };
}

/**
 * Turns relative category weights into question counts that add up to `totalQuestions`
 * (largest-remainder rounding). Resume questions are dropped when there is no profile.
 */
export function buildCategoryPlan(distribution, totalQuestions, { hasProfile }) {
  const usable = distribution.filter(
    ({ category, weight }) => weight > 0 && (hasProfile || category !== 'resume_project'),
  );
  const totalWeight = usable.reduce((sum, { weight }) => sum + weight, 0);
  if (totalWeight === 0) throw new AppError(422, 'This interview track has no question categories configured');

  const exact = usable.map(({ category, weight }) => ({ category, value: (weight / totalWeight) * totalQuestions }));
  const plan = exact.map(({ category, value }) => ({ category, count: Math.floor(value), remainder: value % 1 }));
  let remaining = totalQuestions - plan.reduce((sum, { count }) => sum + count, 0);
  for (const entry of [...plan].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining-- <= 0) break;
    entry.count += 1;
  }
  return plan.filter(({ count }) => count > 0).map(({ category, count }) => ({ category, count }));
}

/** Validates one AI question and normalises option ids to a, b, c… Returns null if unusable. */
function normaliseQuestion(raw, allowedTypes) {
  if (!allowedTypes.includes(raw.type) || !raw.prompt?.trim()) return null;
  if (raw.category === 'mcq' && !CHOICE_TYPES.has(raw.type)) return null;

  const base = {
    category: raw.category,
    topic: raw.topic.trim() || 'General',
    difficulty: raw.difficulty,
    type: raw.type,
    prompt: raw.prompt.trim(),
    codeSnippet: raw.codeSnippet?.trim() || undefined,
    codeLanguage: raw.codeLanguage?.trim() || undefined,
    marks: MARKS_BY_TYPE[raw.type],
    modelAnswer: raw.modelAnswer,
    explanation: raw.explanation,
    expectedKeyConcepts: raw.expectedKeyConcepts.slice(0, 8),
    rubric: raw.rubric.slice(0, 6),
    followUpQuestions: raw.followUpQuestions.slice(0, 3),
  };

  if (!CHOICE_TYPES.has(raw.type)) return { ...base, options: [], correctOptionIds: [] };

  const options = raw.options.filter((option) => option.text?.trim());
  const ids = options.map((option) => option.id);
  if (options.length < 2 || options.length > 6 || new Set(ids).size !== ids.length) return null;

  const correct = raw.correctOptionIds.filter((id) => ids.includes(id));
  if (raw.type === 'single_choice' ? correct.length !== 1 : correct.length < 2) return null;

  const letters = 'abcdef';
  const remap = new Map(ids.map((id, index) => [id, letters[index]]));
  return {
    ...base,
    options: options.map((option, index) => ({ id: letters[index], text: option.text.trim() })),
    correctOptionIds: correct.map((id) => remap.get(id)),
  };
}

export async function generateQuestions(interviewId) {
  const interview = await Interview.findById(interviewId).select('+blueprintSnapshot');
  if (!interview || interview.status !== 'generating') return;

  try {
    const blueprint = interview.blueprintSnapshot;
    const profile = interview.candidateProfile ? await CandidateProfile.findById(interview.candidateProfile) : null;

    const { picked, aiPlan } = await splitPlanWithBank(interview, blueprint.questionTypes);

    const output = aiPlan.length
      ? await aiClient.generateStructured({
          schema: generatedInterviewSchema,
          schemaName: 'mock_interview',
          system: INTERVIEW_GENERATION_SYSTEM,
          user: buildInterviewGenerationInput({
            blueprint,
            config: interview.config,
            categoryPlan: aiPlan,
            candidateProfile: profile,
          }),
        })
      : { questions: [] };

    const valid = output.questions.map((q) => normaliseQuestion(q, blueprint.questionTypes)).filter(Boolean);
    // Bank questions first, then AI questions, keeping the requested number per category in plan order.
    const selected = interview.categoryPlan.flatMap(({ category, count }) => {
      const bankQuestions = picked.get(category) ?? [];
      return [...bankQuestions, ...valid.filter((q) => q.category === category).slice(0, count - bankQuestions.length)];
    });

    const requested = interview.categoryPlan.reduce((sum, { count }) => sum + count, 0);
    if (selected.length < Math.ceil(requested * MIN_USABLE_SHARE)) {
      throw new AppError(502, 'The AI produced too few usable questions. Please try again.');
    }

    await Question.deleteMany({ interview: interview._id });
    await Question.insertMany(
      selected.map((question, index) => ({ ...question, interview: interview._id, order: index + 1 })),
    );

    interview.status = 'ready';
    interview.questionCount = selected.length;
    interview.failedStage = undefined;
    interview.failureReason = undefined;
  } catch (error) {
    interview.status = 'failed';
    interview.failedStage = 'generation';
    interview.failureReason =
      error instanceof AppError ? error.message : 'Interview generation failed. Please try again.';
    if (!(error instanceof AppError)) console.error('[interview] generation error:', error);
  }
  await interview.save();
}
