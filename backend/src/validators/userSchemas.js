import { z } from 'zod';
import { USER_ROLES } from '../models/User.js';
import { newPassword } from './authSchemas.js';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(128),
  newPassword,
});

export const listUsersQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminUpdateUserSchema = z
  .object({
    role: z.enum(USER_ROLES).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((changes) => Object.keys(changes).length > 0, 'Provide a role or status to update');
