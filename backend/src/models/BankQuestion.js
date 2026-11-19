import mongoose from 'mongoose';
import { DIFFICULTIES, QUESTION_CATEGORIES, QUESTION_TYPES } from './InterviewBlueprint.js';

// Admin-curated questions for a role track. Some are mixed into each generated interview.
const bankQuestionSchema = new mongoose.Schema(
  {
    blueprint: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewBlueprint', required: true },
    category: { type: String, enum: QUESTION_CATEGORIES, required: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'medium' },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    prompt: { type: String, required: true, maxlength: 2000 },
    codeSnippet: { type: String, maxlength: 4000 },
    codeLanguage: String,
    options: [{ _id: false, id: String, text: String }],
    correctOptionIds: [String],
    modelAnswer: { type: String, maxlength: 4000 },
    explanation: { type: String, maxlength: 2000 },
    expectedKeyConcepts: [String],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

bankQuestionSchema.index({ blueprint: 1, category: 1, isActive: 1 });

export const BankQuestion = mongoose.model('BankQuestion', bankQuestionSchema);
