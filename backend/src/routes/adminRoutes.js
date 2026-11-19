import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminUpdateUserSchema, listUsersQuerySchema } from '../validators/userSchemas.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/overview', adminController.getOverview);
router.get('/users', validate(listUsersQuerySchema, 'query'), adminController.listUsers);
router.patch('/users/:userId', validate(adminUpdateUserSchema), adminController.updateUser);

export default router;
