import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'interviewos_session';
export const SESSION_DURATION_DAYS = 7;

// SameSite=Lax works because production traffic reaches the API through the
// frontend's own domain (Vercel rewrite), so the cookie is always first-party.
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function clearAuthCookieOptions() {
  const { maxAge, ...options } = authCookieOptions();
  return options;
}
