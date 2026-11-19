import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as content from '../controllers/adminContentController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminUpdateUserSchema, listUsersQuerySchema } from '../validators/userSchemas.js';
import {
  bankQuestionQuerySchema,
  bankQuestionSchema,
  blueprintSchema,
  blueprintUpdateSchema,
  companySchema,
  companyUpdateSchema,
} from '../validators/adminContentSchemas.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/overview', adminController.getOverview);
router.get('/users', validate(listUsersQuerySchema, 'query'), adminController.listUsers);
router.patch('/users/:userId', validate(adminUpdateUserSchema), adminController.updateUser);

router.get('/companies', content.listCompanies);
router.post('/companies', validate(companySchema), content.createCompany);
router.patch('/companies/:companyId', validate(companyUpdateSchema), content.updateCompany);
router.delete('/companies/:companyId', content.deleteCompany);
router.get('/companies/:companyId/blueprints', content.listBlueprints);

router.get('/blueprints', content.listAllBlueprints);
router.post('/blueprints', validate(blueprintSchema), content.createBlueprint);
router.patch('/blueprints/:blueprintId', validate(blueprintUpdateSchema), content.updateBlueprint);
router.delete('/blueprints/:blueprintId', content.deleteBlueprint);

router.get('/question-bank', validate(bankQuestionQuerySchema, 'query'), content.listBankQuestions);
router.post('/question-bank', validate(bankQuestionSchema), content.createBankQuestion);
router.put('/question-bank/:questionId', validate(bankQuestionSchema), content.updateBankQuestion);
router.delete('/question-bank/:questionId', content.deleteBankQuestion);

router.get('/statistics', content.getStatistics);
router.get('/interviews/:interviewId/integrity', content.getInterviewIntegrity);

export default router;
