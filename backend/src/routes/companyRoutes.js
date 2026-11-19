import { Router } from 'express';
import * as companyController from '../controllers/companyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', companyController.listCompanies);
router.get('/:slug', companyController.getCompany);

export default router;
