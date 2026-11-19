import * as userService from '../services/userService.js';
import { createSessionToken } from '../services/authService.js';
import { AUTH_COOKIE_NAME, authCookieOptions } from '../utils/authCookie.js';

export async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user, req.body);
  res.json({ user });
}

export async function changePassword(req, res) {
  const user = await userService.changePassword(req.user.id, req.body);
  // Other sessions are now invalid; keep this one signed in with a fresh token.
  res.cookie(AUTH_COOKIE_NAME, createSessionToken(user), authCookieOptions());
  res.json({ message: 'Password updated. Other devices have been signed out.' });
}
