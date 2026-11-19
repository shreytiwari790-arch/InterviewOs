import { Router } from 'express';
import { createContactMessage } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { contactMessageSchema } from '../validators/contactSchemas.js';

const router = Router();

router.post('/', contactLimiter, validate(contactMessageSchema), createContactMessage);

export default router;
