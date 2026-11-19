import * as authService from '../services/authService.js';
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from '../utils/authCookie.js';

function startSession(res, user) {
  res.cookie(AUTH_COOKIE_NAME, authService.createSessionToken(user), authCookieOptions());
}

export async function register(req, res) {
  const user = await authService.registerUser(req.body);
  startSession(res, user);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const user = await authService.authenticateUser(req.body);
  startSession(res, user);
  res.json({ user });
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions());
  res.status(204).end();
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

export async function forgotPassword(req, res) {
  await authService.requestPasswordReset(req.body.email);
  res.json({ message: 'If an account exists for this email, a password reset link has been sent.' });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  res.json({ message: 'Your password has been reset. You can now sign in.' });
}
