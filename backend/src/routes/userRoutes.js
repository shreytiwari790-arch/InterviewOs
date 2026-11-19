import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { changePasswordSchema, updateProfileSchema } from '../validators/userSchemas.js';

const router = Router();

router.use(requireAuth);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/password', authLimiter, validate(changePasswordSchema), userController.changePassword);

export default router;
