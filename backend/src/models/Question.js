import mongoose from 'mongoose';
import { DIFFICULTIES, QUESTION_CATEGORIES, QUESTION_TYPES } from './InterviewBlueprint.js';

// Fields marked select:false form the answer key. They are never sent to the browser
// while an interview is active (see interviewService.toCandidateQuestion).
const questionSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    order: { type: Number, required: true },
    category: { type: String, enum: QUESTION_CATEGORIES, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTIES },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    prompt: { type: String, required: true },
    codeSnippet: String,
    codeLanguage: String,
    options: [{ _id: false, id: String, text: String }],
    marks: { type: Number, required: true },
    source: { type: String, enum: ['ai', 'bank'], default: 'ai' },

    correctOptionIds: { type: [String], select: false },
    modelAnswer: { type: String, select: false },
    explanation: { type: String, select: false },
    expectedKeyConcepts: { type: [String], select: false },
    rubric: { type: [{ _id: false, criterion: String, description: String }], select: false },
    followUpQuestions: { type: [String], select: false },
  },
  { timestamps: true },
);

questionSchema.index({ interview: 1, order: 1 }, { unique: true });

export const Question = mongoose.model('Question', questionSchema);
