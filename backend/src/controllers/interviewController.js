import * as interviewService from '../services/interviewService.js';
import { recordIntegrityEvents } from '../services/integrityService.js';
import { writeReportPdf } from '../services/reportPdfService.js';
import { slugify } from '../utils/slugify.js';

export async function createInterview(req, res) {
  const interview = await interviewService.createInterview(req.user.id, req.body);
  res.status(202).json({ interview });
}

export async function listInterviews(req, res) {
  res.json({ interviews: await interviewService.listInterviews(req.user.id) });
}

export async function getInterview(req, res) {
  res.json(await interviewService.getInterviewSession(req.user.id, req.params.interviewId));
}

export async function startInterview(req, res) {
  res.json({ interview: await interviewService.startInterview(req.user.id, req.params.interviewId) });
}

export async function saveAnswer(req, res) {
  const { interviewId, questionId } = req.params;
  res.json({ response: await interviewService.saveAnswer(req.user.id, interviewId, questionId, req.body) });
}

export async function finishInterview(req, res) {
  res.status(202).json({ interview: await interviewService.finishInterview(req.user.id, req.params.interviewId) });
}

export async function retryInterview(req, res) {
  res.status(202).json({ interview: await interviewService.retryInterview(req.user.id, req.params.interviewId) });
}

export async function getReport(req, res) {
  res.json(await interviewService.getInterviewReport(req.user.id, req.params.interviewId));
}

export async function downloadReportPdf(req, res) {
  const data = await interviewService.getInterviewReport(req.user.id, req.params.interviewId);
  const fileName = `interviewos-${slugify(`${data.interview.company.name}-${data.interview.role.name}`)}-report.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  writeReportPdf(res, { ...data, candidateName: req.user.name });
}

export async function recordEvents(req, res) {
  res.status(201).json(await recordIntegrityEvents(req.user.id, req.params.interviewId, req.body.events));
}
