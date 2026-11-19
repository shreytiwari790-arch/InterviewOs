import { api } from './api';

export const dashboardService = {
  getCandidateDashboard: (signal) => api.get('/dashboard', { signal }),
};
