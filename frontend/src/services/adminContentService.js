import { api } from './api';

const toQuery = (filters) =>
  new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value != null)).toString();

export const adminContentService = {
  listCompanies: (signal) => api.get('/admin/companies', { signal }),
  createCompany: (company) => api.post('/admin/companies', company),
  updateCompany: (companyId, changes) => api.patch(`/admin/companies/${companyId}`, changes),
  deleteCompany: (companyId) => api.delete(`/admin/companies/${companyId}`),

  listCompanyBlueprints: (companyId, signal) => api.get(`/admin/companies/${companyId}/blueprints`, { signal }),
  listAllBlueprints: (signal) => api.get('/admin/blueprints', { signal }),
  createBlueprint: (blueprint) => api.post('/admin/blueprints', blueprint),
  updateBlueprint: (blueprintId, changes) => api.patch(`/admin/blueprints/${blueprintId}`, changes),
  deleteBlueprint: (blueprintId) => api.delete(`/admin/blueprints/${blueprintId}`),

  listBankQuestions: (filters, signal) => api.get(`/admin/question-bank?${toQuery(filters)}`, { signal }),
  createBankQuestion: (question) => api.post('/admin/question-bank', question),
  updateBankQuestion: (questionId, question) => api.put(`/admin/question-bank/${questionId}`, question),
  deleteBankQuestion: (questionId) => api.delete(`/admin/question-bank/${questionId}`),

  getStatistics: (signal) => api.get('/admin/statistics', { signal }),
  getInterviewIntegrity: (interviewId, signal) => api.get(`/admin/interviews/${interviewId}/integrity`, { signal }),
};
