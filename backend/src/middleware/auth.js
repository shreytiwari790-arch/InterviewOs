import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { AUTH_COOKIE_NAME } from '../utils/authCookie.js';

// Middleware: verifies the JWT stored in the HTTP-only cookie and attaches the user to req.user.
// Throws 401 if the token is missing, expired, or the user's session has been invalidated.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) throw new AppError(401, 'Please sign in to continue');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'Your session has expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  // sessionVersion is bumped on password reset, which invalidates older sessions.
  if (!user || !user.isActive || user.sessionVersion !== payload.ver) {
    throw new AppError(401, 'Your session has expired. Please sign in again.');
  }

  req.user = user;
  next();
}

// Middleware factory: restricts access to users whose role matches one of the provided roles.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
