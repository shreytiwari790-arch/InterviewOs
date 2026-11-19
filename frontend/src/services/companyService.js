import { api } from './api';

export const companyService = {
  list: (signal) => api.get('/companies', { signal }),
  get: (slug, signal) => api.get(`/companies/${slug}`, { signal }),
};
