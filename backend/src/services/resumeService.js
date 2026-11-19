import { CandidateProfile } from '../models/CandidateProfile.js';
import { Resume } from '../models/Resume.js';
import { RESUME_TYPES } from '../middleware/upload.js';
import {
  RESUME_ANALYSIS_SYSTEM,
  buildResumeAnalysisInput,
  resumeAnalysisSchema,
} from '../prompts/resumeAnalysisPrompt.js';
import { AppError } from '../utils/AppError.js';
import { runInBackground } from '../utils/runInBackground.js';
import { aiClient } from './aiClient.js';
import { extractResumeText } from './resumeTextService.js';

const MAX_RESUMES_PER_USER = 5;
const LIST_LIMIT = 8;

const unique = (items, limit) => [...new Set(items.map((item) => item.trim()).filter(Boolean))].slice(0, limit);

async function findOwnedResume(userId, resumeId) {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new AppError(404, 'Resume not found');
  return resume;
}

export async function analyzeResume(resumeId) {
  const resume = await Resume.findById(resumeId).select('+extractedText');
  if (!resume) return;

  try {
    const analysis = await aiClient.generateStructured({
      schema: resumeAnalysisSchema,
      schemaName: 'resume_analysis',
      system: RESUME_ANALYSIS_SYSTEM,
      user: buildResumeAnalysisInput(resume.extractedText),
    });

    if (!analysis.isResume) {
      throw new AppError(422, 'This document does not look like a resume. Please upload your CV.');
    }

    await CandidateProfile.findOneAndUpdate(
      { resume: resume._id },
      {
        user: resume.user,
        resume: resume._id,
        summary: analysis.summary,
        estimatedExperienceLevel: analysis.estimatedExperienceLevel,
        technicalSkills: unique(analysis.technicalSkills, 30),
        programmingLanguages: unique(analysis.programmingLanguages, 15),
        frameworks: unique(analysis.frameworks, 20),
        tools: unique(analysis.tools, 20),
        projects: analysis.projects.slice(0, 8),
        education: analysis.education.slice(0, 5),
        experience: analysis.experience.slice(0, 8),
        suggestedFocusAreas: analysis.suggestedFocusAreas.slice(0, 6),
      },
      { upsert: true, runValidators: true },
    );

    resume.status = 'analyzed';
    resume.failureReason = undefined;
    resume.analyzedAt = new Date();
  } catch (error) {
    resume.status = 'failed';
    resume.failureReason = error instanceof AppError ? error.message : 'Analysis failed. Please try again.';
  }
  await resume.save();
}

export async function uploadResume(userId, file) {
  if (!file) throw new AppError(400, 'Choose a PDF or DOCX file to upload');

  if ((await Resume.countDocuments({ user: userId })) >= MAX_RESUMES_PER_USER) {
    throw new AppError(409, `You can keep up to ${MAX_RESUMES_PER_USER} resumes. Delete an old one first.`);
  }

  const kind = RESUME_TYPES[file.mimetype];
  const extractedText = await extractResumeText(file.buffer, kind);

  const resume = await Resume.create({
    user: userId,
    fileName: file.originalname.slice(0, 255),
    mimeType: file.mimetype,
    sizeBytes: file.size,
    extractedText,
    status: 'analyzing',
  });

  runInBackground(`resume analysis ${resume.id}`, () => analyzeResume(resume.id));
  return resume;
}

export async function retryAnalysis(userId, resumeId) {
  const resume = await findOwnedResume(userId, resumeId);
  if (resume.status === 'analyzing') throw new AppError(409, 'This resume is already being analysed');

  resume.status = 'analyzing';
  resume.failureReason = undefined;
  await resume.save();
  runInBackground(`resume analysis ${resume.id}`, () => analyzeResume(resume.id));
  return resume;
}

export function listResumes(userId) {
  return Resume.find({ user: userId }).sort({ createdAt: -1 }).limit(LIST_LIMIT);
}

export async function getResumeWithProfile(userId, resumeId) {
  const resume = await findOwnedResume(userId, resumeId);
  const profile = await CandidateProfile.findOne({ resume: resume._id });
  return { resume, profile };
}

export async function deleteResume(userId, resumeId) {
  const resume = await findOwnedResume(userId, resumeId);
  await CandidateProfile.deleteOne({ resume: resume._id });
  await resume.deleteOne();
}

/** The most recent analysed profile, used to personalise interviews and the dashboard. */
export async function getLatestProfile(userId) {
  const resume = await Resume.findOne({ user: userId, status: 'analyzed' }).sort({ analyzedAt: -1 });
  return resume ? CandidateProfile.findOne({ resume: resume._id }) : null;
}
