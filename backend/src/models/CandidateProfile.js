import mongoose from 'mongoose';

export const EXPERIENCE_LEVELS = ['fresher', 'junior', 'mid', 'senior'];

// AI-extracted view of one resume. These are the candidate's own claims and are not verified.
const candidateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, unique: true },
    summary: String,
    estimatedExperienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
    technicalSkills: [String],
    programmingLanguages: [String],
    frameworks: [String],
    tools: [String],
    projects: [{ _id: false, name: String, description: String, technologies: [String] }],
    education: [
      { _id: false, institution: String, degree: String, fieldOfStudy: String, graduationYear: String, score: String },
    ],
    experience: [{ _id: false, organization: String, role: String, duration: String, highlights: [String] }],
    suggestedFocusAreas: [{ _id: false, topic: String, reason: String }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { _id, __v, user, ...rest } = ret;
        return { id: _id.toString(), ...rest };
      },
    },
  },
);

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
