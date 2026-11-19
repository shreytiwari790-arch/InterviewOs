import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { sanitizeInput } from './middleware/sanitizeInput.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // Render and Vercel sit in front of the app; needed for correct client IPs.
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || env.clientOrigins.includes(origin)),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());
  app.use(sanitizeInput);

  app.use('/api', apiLimiter, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
