import mongoose from 'mongoose';

export const INTERVIEW_STATUSES = [
  'generating',
  'ready',
  'in_progress',
  'evaluating',
  'completed',
  'failed',
  'abandoned',
];

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Snapshot of what the candidate chose, so later admin edits never change past interviews.
    company: {
      name: { type: String, required: true },
      slug: String,
    },
    role: {
      name: { type: String, required: true },
      track: String,
    },
    config: {
      experienceLevel: String,
      difficulty: String,
      durationMinutes: Number,
      totalQuestions: Number,
    },

    status: { type: String, enum: INTERVIEW_STATUSES, default: 'generating' },
    startedAt: Date,
    expiresAt: Date,
    completedAt: Date,
    overallScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true },
);

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, status: 1, completedAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);
