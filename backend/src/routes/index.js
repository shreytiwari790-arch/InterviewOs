import { Router } from 'express';
import mongoose from 'mongoose';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import companyRoutes from './companyRoutes.js';
import contactRoutes from './contactRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({ status: databaseConnected ? 'ok' : 'degraded', databaseConnected });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/resumes', resumeRoutes);
router.use('/companies', companyRoutes);
router.use('/interviews', interviewRoutes);
router.use('/admin', adminRoutes);

export default router;
