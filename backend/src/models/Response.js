import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answerText: { type: String, maxlength: 5000, default: '' },
    selectedOptionIds: { type: [String], default: [] },
    submittedAt: Date, // Set when the candidate presses "Submit answer"; drafts are autosaved without it.

    score: Number,
    maxScore: Number,
    isCorrect: Boolean,
    feedback: String,
    missedConcepts: [String],
    criteriaScores: { correctness: Number, relevance: Number, completeness: Number, clarity: Number },
  },
  { timestamps: true },
);

responseSchema.index({ interview: 1, question: 1 }, { unique: true });

export const Response = mongoose.model('Response', responseSchema);
