import mongoose from 'mongoose';

const scoreSchema = { score: { type: Number, min: 0, max: 100, required: true } };

const interviewReportSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    categoryScores: [{ category: { type: String, required: true }, ...scoreSchema, _id: false }],
    topicScores: [{ topic: { type: String, required: true }, ...scoreSchema, _id: false }],
    strengths: [String],
    weakTopics: [String],
    recommendations: [String],
    summary: String,
  },
  { timestamps: true },
);

interviewReportSchema.index({ user: 1, createdAt: -1 });

export const InterviewReport = mongoose.model('InterviewReport', interviewReportSchema);
