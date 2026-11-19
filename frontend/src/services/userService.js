import { api } from './api';

export const userService = {
  updateProfile: (details) => api.patch('/users/me', details),
  changePassword: (passwords) => api.patch('/users/me/password', passwords),
  joinProWaitlist: () => api.post('/users/me/pro-waitlist'),
};
