import { api } from './api';

export const adminService = {
  getOverview: (signal) => api.get('/admin/overview', { signal }),
  listUsers: (filters, signal) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value != null));
    return api.get(`/admin/users?${query}`, { signal });
  },
  updateUser: (userId, changes) => api.patch(`/admin/users/${userId}`, changes),
};
