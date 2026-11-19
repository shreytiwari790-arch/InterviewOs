import * as resumeService from '../services/resumeService.js';

export async function uploadResume(req, res) {
  const resume = await resumeService.uploadResume(req.user.id, req.file);
  res.status(201).json({ resume });
}

export async function listResumes(req, res) {
  res.json({ resumes: await resumeService.listResumes(req.user.id) });
}

export async function getResume(req, res) {
  res.json(await resumeService.getResumeWithProfile(req.user.id, req.params.resumeId));
}

export async function retryAnalysis(req, res) {
  const resume = await resumeService.retryAnalysis(req.user.id, req.params.resumeId);
  res.status(202).json({ resume });
}

export async function deleteResume(req, res) {
  await resumeService.deleteResume(req.user.id, req.params.resumeId);
  res.status(204).end();
}
