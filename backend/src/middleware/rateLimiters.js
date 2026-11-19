import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function createLimiter(limit, message) {
  return rateLimit({
    windowMs: FIFTEEN_MINUTES,
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
