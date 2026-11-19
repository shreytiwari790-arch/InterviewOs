import { z } from 'zod';
import { EXPERIENCE_LEVELS } from '../models/CandidateProfile.js';
import { DIFFICULTIES } from '../models/InterviewBlueprint.js';
import { INTEGRITY_EVENT_TYPES } from '../models/ProctoringEvent.js';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid identifier');

export const createInterviewSchema = z.object({
  blueprintId: objectId,
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
  durationMinutes: z.coerce.number().int().min(10, 'Minimum 10 minutes').max(120, 'Maximum 120 minutes').optional(),
  totalQuestions: z.coerce.number().int().min(5, 'Minimum 5 questions').max(30, 'Maximum 30 questions').optional(),
});

export const saveAnswerSchema = z.object({
  answerText: z.string().max(5000, 'Answers are limited to 5,000 characters').default(''),
  selectedOptionIds: z.array(z.string().max(4)).max(6).default([]),
  submit: z.boolean().default(false),
});

export const integrityEventsSchema = z.object({
  events: z
    .array(
      z.object({
        type: z.enum(INTEGRITY_EVENT_TYPES),
        occurredAt: z.coerce.date(),
        questionNumber: z.number().int().min(1).max(100).optional(),
      }),
    )
    .min(1)
    .max(50),
});
