import mongoose from 'mongoose';
import { EXPERIENCE_LEVELS } from './CandidateProfile.js';
import { DIFFICULTIES } from './InterviewBlueprint.js';

export const INTERVIEW_STATUSES = ['generating', 'ready', 'in_progress', 'evaluating', 'completed', 'failed'];

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blueprint: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewBlueprint' },
    candidateProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateProfile' },

    // Snapshot taken at creation, so later admin edits never change past interviews or reports.
    company: { name: { type: String, required: true }, slug: String },
    role: { name: { type: String, required: true }, track: String },
    blueprintSnapshot: { type: mongoose.Schema.Types.Mixed, select: false },
    config: {
      experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
      difficulty: { type: String, enum: DIFFICULTIES },
      durationMinutes: Number,
      totalQuestions: Number,
    },
    categoryPlan: [{ _id: false, category: String, count: Number }],

    status: { type: String, enum: INTERVIEW_STATUSES, default: 'generating' },
    failedStage: { type: String, enum: ['generation', 'evaluation'] },
    failureReason: String,
    questionCount: { type: Number, default: 0 },
    startedAt: Date,
    expiresAt: Date,
    submittedAt: Date,
    completedAt: Date,
    overallScore: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, user, blueprintSnapshot, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, status: 1, completedAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);
