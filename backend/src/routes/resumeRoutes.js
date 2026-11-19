import { Router } from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { resumeUpload } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);
router.get('/', resumeController.listResumes);
router.post('/', aiLimiter, resumeUpload, resumeController.uploadResume);
router.get('/:resumeId', resumeController.getResume);
router.post('/:resumeId/analyze', aiLimiter, resumeController.retryAnalysis);
router.delete('/:resumeId', resumeController.deleteResume);

export default router;
