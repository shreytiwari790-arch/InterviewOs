import { Router } from 'express';
import mongoose from 'mongoose';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({ status: databaseConnected ? 'ok' : 'degraded', databaseConnected });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
