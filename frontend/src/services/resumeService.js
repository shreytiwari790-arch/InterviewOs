import { api } from './api';

export const resumeService = {
  list: (signal) => api.get('/resumes', { signal }),
  get: (resumeId, signal) => api.get(`/resumes/${resumeId}`, { signal }),
  upload: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/resumes', form);
  },
  retryAnalysis: (resumeId) => api.post(`/resumes/${resumeId}/analyze`),
  remove: (resumeId) => api.delete(`/resumes/${resumeId}`),
};
