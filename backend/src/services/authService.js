import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { SESSION_DURATION_DAYS } from '../utils/authCookie.js';
import { sendPasswordResetLink } from './mailService.js';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('interviewos-timing-guard', BCRYPT_ROUNDS);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function createSessionToken(user) {
  return jwt.sign({ sub: user.id, ver: user.sessionVersion }, env.JWT_SECRET, {
    expiresIn: `${SESSION_DURATION_DAYS}d`,
  });
}

export async function registerUser({ name, email, password }) {
  if (await User.exists({ email })) {
    throw new AppError(409, 'An account with this email already exists', [
      { field: 'email', message: 'This email is already registered' },
    ]);
  }

  return User.create({ name, email, passwordHash: await hashPassword(password), lastLoginAt: new Date() });
}

export async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) throw new AppError(401, 'Incorrect email or password');
  if (!user.isActive) throw new AppError(403, 'This account has been deactivated');

  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return; // Same response either way, so emails cannot be enumerated.

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${env.clientOrigins[0]}/reset-password?token=${token}`;
  await sendPasswordResetLink({ to: user.email, name: user.name, resetUrl });
}

export async function resetPassword({ token, password }) {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new AppError(400, 'This reset link is invalid or has expired');

  user.passwordHash = await hashPassword(password);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  user.sessionVersion += 1; // Signs out every existing session.
  await user.save();
}
