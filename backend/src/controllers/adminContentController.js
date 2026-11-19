import * as contentService from '../services/adminContentService.js';
import { getIntegritySummary } from '../services/integrityService.js';
import { getPlatformStatistics } from '../services/statisticsService.js';
import { Interview } from '../models/Interview.js';
import { AppError } from '../utils/AppError.js';

export async function listCompanies(req, res) {
  res.json({ companies: await contentService.listCompaniesForAdmin() });
}
export async function createCompany(req, res) {
  res.status(201).json({ company: await contentService.createCompany(req.body) });
}
export async function updateCompany(req, res) {
  res.json({ company: await contentService.updateCompany(req.params.companyId, req.body) });
}
export async function deleteCompany(req, res) {
  await contentService.deleteCompany(req.params.companyId);
  res.status(204).end();
}

export async function listBlueprints(req, res) {
  res.json(await contentService.listBlueprintsForCompany(req.params.companyId));
}
export async function listAllBlueprints(req, res) {
  res.json({ blueprints: await contentService.listAllBlueprints() });
}
export async function createBlueprint(req, res) {
  res.status(201).json({ blueprint: await contentService.createBlueprint(req.body) });
}
export async function updateBlueprint(req, res) {
  res.json({ blueprint: await contentService.updateBlueprint(req.params.blueprintId, req.body) });
}
export async function deleteBlueprint(req, res) {
  await contentService.deleteBlueprint(req.params.blueprintId);
  res.status(204).end();
}

export async function listBankQuestions(req, res) {
  res.json(await contentService.listBankQuestions(req.validatedQuery));
}
export async function createBankQuestion(req, res) {
  res.status(201).json({ question: await contentService.createBankQuestion(req.body, req.user.id) });
}
export async function updateBankQuestion(req, res) {
  res.json({ question: await contentService.updateBankQuestion(req.params.questionId, req.body) });
}
export async function deleteBankQuestion(req, res) {
  await contentService.deleteBankQuestion(req.params.questionId);
  res.status(204).end();
}

export async function getStatistics(req, res) {
  res.json(await getPlatformStatistics());
}

export async function getInterviewIntegrity(req, res) {
  const interview = await Interview.findById(req.params.interviewId).populate('user', 'name email');
  if (!interview) throw new AppError(404, 'Interview not found');
  res.json({
    interview: {
      id: interview.id,
      company: interview.company,
      role: interview.role,
      status: interview.status,
      startedAt: interview.startedAt,
      submittedAt: interview.submittedAt,
      overallScore: interview.overallScore,
      candidate: { name: interview.user.name, email: interview.user.email },
    },
    integrity: await getIntegritySummary(interview._id),
  });
}
