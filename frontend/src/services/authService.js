import { api } from './api';

export const authService = {
  getCurrentUser: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (details) => api.post('/auth/register', details),
  logout: () => api.post('/auth/logout'),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};
