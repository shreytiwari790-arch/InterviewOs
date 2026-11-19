import mongoose from 'mongoose';
import { EXPERIENCE_LEVELS } from './CandidateProfile.js';

export const QUESTION_CATEGORIES = ['resume_project', 'mcq', 'programming', 'core_cs', 'scenario', 'hr'];
export const QUESTION_TYPES = ['single_choice', 'multi_select', 'short_answer', 'long_answer'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const SOURCE_RELIABILITY = ['official', 'high', 'medium', 'low', 'unverified'];

/**
 * A preparation profile for one role at one company. Editable by admins; interviews take a
 * snapshot of it when they are generated. Not an official interview pattern.
 */
const interviewBlueprintSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    roleName: { type: String, required: true, trim: true },
    track: String,
    region: { type: String, default: 'India' },
    summary: { type: String, maxlength: 400 },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, default: 'fresher' },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'medium' },
    durationMinutes: { type: Number, min: 10, max: 180, default: 45 },
    totalQuestions: { type: Number, min: 5, max: 40, default: 15 },
    // Relative weights per category; scaled to the number of questions a candidate chooses.
    categoryDistribution: [
      {
        _id: false,
        category: { type: String, enum: QUESTION_CATEGORIES, required: true },
        weight: { type: Number, min: 0, required: true },
      },
    ],
    topics: [String],
    questionTypes: [{ type: String, enum: QUESTION_TYPES }],
    focusNotes: { type: String, maxlength: 1000 },
    sources: [
      {
        _id: false,
        label: String,
        url: String,
        reliability: { type: String, enum: SOURCE_RELIABILITY, default: 'unverified' },
      },
    ],
    lastVerifiedAt: Date,
    isActive: { type: Boolean, default: true },
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

export const InterviewBlueprint = mongoose.model('InterviewBlueprint', interviewBlueprintSchema);
