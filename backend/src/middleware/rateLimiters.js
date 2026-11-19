import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function createLimiter(limit, message, { windowMs = FIFTEEN_MINUTES, keyGenerator } = {}) {
  return rateLimit({
    windowMs,
    ...(keyGenerator && { keyGenerator }),
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message },
    skip: () => env.NODE_ENV === 'test',
  });
}

export const apiLimiter = createLimiter(300, 'Too many requests. Please slow down and try again shortly.');
export const authLimiter = createLimiter(20, 'Too many attempts. Please wait a few minutes and try again.');
export const contactLimiter = createLimiter(5, 'You have sent several messages recently. Please try again later.');

// AI calls cost money, so they are limited per signed-in user rather than per IP.
export const aiLimiter = createLimiter(
  30,
  'You have reached the hourly limit for AI requests. Please try again later.',
  {
    windowMs: 60 * 60 * 1000,
    keyGenerator: (req) => req.user.id,
  },
);
