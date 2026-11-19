export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  start: '/start',
  dashboard: '/dashboard',
  resume: '/resume',
  newInterview: '/interviews/new',
  interviewHistory: '/interviews',
  settings: '/settings',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminCompanies: '/admin/companies',
  adminPatterns: '/admin/patterns',
  adminQuestions: '/admin/questions',
  adminStatistics: '/admin/statistics',
};

export const interviewPath = (interviewId) => `/interviews/${interviewId}`;
export const reportPath = (interviewId) => `/interviews/${interviewId}/report`;

export const adminCompanyPath = (companyId) => `/admin/companies/${companyId}`;
export const adminRoleEditorPath = (companyId, blueprintId = 'new') =>
  `/admin/companies/${companyId}/roles/${blueprintId}`;

// After signing in, candidates land on their start page and admins on the admin panel.
export const homePathFor = (user) => (user?.role === 'admin' ? paths.admin : paths.start);
