import { API_BASE_URL, api } from './api';

export const interviewService = {
  create: (config) => api.post('/interviews', config),
  list: (signal) => api.get('/interviews', { signal }),
  // clockOffsetMs lets the timer follow the server clock even if the device clock is wrong.
  getSession: async (interviewId, signal) => {
    const session = await api.get(`/interviews/${interviewId}`, { signal });
    return { ...session, clockOffsetMs: new Date(session.serverTime).getTime() - Date.now() };
  },
  start: (interviewId) => api.post(`/interviews/${interviewId}/start`),
  saveAnswer: (interviewId, questionId, answer) => api.put(`/interviews/${interviewId}/answers/${questionId}`, answer),
  finish: (interviewId) => api.post(`/interviews/${interviewId}/finish`),
  retry: (interviewId) => api.post(`/interviews/${interviewId}/retry`),
  getReport: (interviewId, signal) => api.get(`/interviews/${interviewId}/report`, { signal }),
  reportPdfUrl: (interviewId) => `${API_BASE_URL}/interviews/${interviewId}/report/pdf`,
  recordIntegrityEvents: (interviewId, events) => api.post(`/interviews/${interviewId}/integrity-events`, { events }),
};
