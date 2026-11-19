export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
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

// Pages that ship in later build phases. Links to them render disabled until the page exists.
export const upcomingPaths = new Set([
  paths.resume,
  paths.newInterview,
  paths.interviewHistory,
  paths.adminCompanies,
  paths.adminPatterns,
  paths.adminQuestions,
  paths.adminStatistics,
]);

export const interviewPath = (interviewId) => `/interviews/${interviewId}`;

export const homePathFor = (user) => (user?.role === 'admin' ? paths.admin : paths.dashboard);
