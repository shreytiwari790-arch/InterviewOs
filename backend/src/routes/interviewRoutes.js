import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { createInterviewSchema, integrityEventsSchema, saveAnswerSchema } from '../validators/interviewSchemas.js';

const router = Router();

router.use(requireAuth);
router.get('/', interviewController.listInterviews);
router.post('/', aiLimiter, validate(createInterviewSchema), interviewController.createInterview);
router.get('/:interviewId', interviewController.getInterview);
router.post('/:interviewId/start', interviewController.startInterview);
router.put('/:interviewId/answers/:questionId', validate(saveAnswerSchema), interviewController.saveAnswer);
router.post('/:interviewId/finish', aiLimiter, interviewController.finishInterview);
router.post('/:interviewId/retry', aiLimiter, interviewController.retryInterview);
router.get('/:interviewId/report', interviewController.getReport);
router.get('/:interviewId/report/pdf', interviewController.downloadReportPdf);
router.post('/:interviewId/integrity-events', validate(integrityEventsSchema), interviewController.recordEvents);

export default router;
