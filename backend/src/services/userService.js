import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword } from './authService.js';

export async function updateProfile(user, { name }) {
  user.name = name;
  await user.save();
  return user;
}

/** Changes the password and signs out every other session; returns the updated user. */
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash');

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(400, 'Current password is incorrect', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }

  user.passwordHash = await hashPassword(newPassword);
  user.sessionVersion += 1;
  await user.save();
  return user;
}
