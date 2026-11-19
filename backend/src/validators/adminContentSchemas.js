import { z } from 'zod';
import { EXPERIENCE_LEVELS } from '../models/CandidateProfile.js';
import { DIFFICULTIES, QUESTION_CATEGORIES, QUESTION_TYPES, SOURCE_RELIABILITY } from '../models/InterviewBlueprint.js';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid identifier');
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens')
  .max(80);
const shortText = (max) => z.string().trim().max(max);
const stringList = (maxItems, maxLength = 80) =>
  z
    .array(z.string().trim().min(1).max(maxLength))
    .max(maxItems)
    .transform((items) => [...new Set(items)]);

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Enter a company name').max(80),
  slug: slug.optional(),
  description: shortText(600).optional(),
  industry: shortText(60).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i, 'Use a hex colour like #0a9a78')
    .optional(),
  isActive: z.boolean().optional(),
});
export const companyUpdateSchema = companySchema.partial();

const distributionSchema = z
  .array(z.object({ category: z.enum(QUESTION_CATEGORIES), weight: z.number().min(0).max(100) }))
  .min(1, 'Add at least one category')
  .max(QUESTION_CATEGORIES.length)
  .refine((items) => new Set(items.map((item) => item.category)).size === items.length, 'Each category can appear once')
  .refine((items) => items.some((item) => item.weight > 0), 'At least one category needs a weight above zero');

const sourceSchema = z.object({
  label: shortText(120).default(''),
  url: z.union([z.literal(''), z.string().trim().url('Enter a valid URL').max(500)]).default(''),
  reliability: z.enum(SOURCE_RELIABILITY).default('unverified'),
});

const blueprintFields = {
  slug: slug.optional(),
  roleName: z.string().trim().min(2, 'Enter a role name').max(80),
  track: shortText(80).optional(),
  region: shortText(60).optional(),
  summary: shortText(400).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS),
  difficulty: z.enum(DIFFICULTIES),
  durationMinutes: z.number().int().min(10).max(180),
  totalQuestions: z.number().int().min(5).max(40),
  categoryDistribution: distributionSchema,
  topics: stringList(25),
  questionTypes: z
    .array(z.enum(QUESTION_TYPES))
    .min(1, 'Allow at least one question type')
    .transform((items) => [...new Set(items)]),
  focusNotes: shortText(1000).optional(),
  sources: z.array(sourceSchema).max(10).default([]),
  lastVerifiedAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
};

export const blueprintSchema = z
  .object({ company: objectId, ...blueprintFields })
  .refine(
    (blueprint) =>
      !blueprint.categoryDistribution.some((c) => c.category === 'mcq' && c.weight > 0) ||
      blueprint.questionTypes.some((type) => type === 'single_choice' || type === 'multi_select'),
    { message: 'MCQ questions need single choice or multiple select to be allowed', path: ['questionTypes'] },
  );
export const blueprintUpdateSchema = z.object(blueprintFields).partial();

const CHOICE_TYPES = ['single_choice', 'multi_select'];

export const bankQuestionSchema = z
  .object({
    blueprint: objectId,
    category: z.enum(QUESTION_CATEGORIES),
    topic: z.string().trim().min(1, 'Enter a topic').max(80),
    difficulty: z.enum(DIFFICULTIES).default('medium'),
    type: z.enum(QUESTION_TYPES),
    prompt: z.string().trim().min(10, 'Write the question').max(2000),
    codeSnippet: shortText(4000).optional(),
    codeLanguage: shortText(30).optional(),
    options: z
      .array(z.object({ text: z.string().trim().min(1, 'Option text is required').max(300) }))
      .max(6)
      .default([]),
    correctOptionIndexes: z.array(z.number().int().min(0).max(5)).default([]),
    modelAnswer: shortText(4000).optional(),
    explanation: shortText(2000).optional(),
    expectedKeyConcepts: stringList(10).default([]),
    isActive: z.boolean().default(true),
  })
  .superRefine((question, context) => {
    const isChoice = CHOICE_TYPES.includes(question.type);
    if (question.category === 'mcq' && !isChoice) {
      context.addIssue({
        code: 'custom',
        path: ['type'],
        message: 'MCQ questions must be single choice or multiple select',
      });
    }
    if (!isChoice) return;
    if (question.options.length < 2) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'Add at least two options' });
    }
    const correct = [...new Set(question.correctOptionIndexes)].filter((index) => index < question.options.length);
    if (question.type === 'single_choice' ? correct.length !== 1 : correct.length < 2) {
      context.addIssue({
        code: 'custom',
        path: ['correctOptionIndexes'],
        message:
          question.type === 'single_choice' ? 'Mark exactly one correct option' : 'Mark at least two correct options',
      });
    }
  });

export const bankQuestionQuerySchema = z.object({
  blueprint: objectId.optional(),
  category: z.enum(QUESTION_CATEGORIES).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
