import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { GuestOnly } from './components/routing/GuestOnly';
import { RequireAuth } from './components/routing/RequireAuth';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { CandidateLayout } from './layouts/CandidateLayout';
import { FocusLayout } from './layouts/FocusLayout';
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { FullPageLoader } from './components/ui/FullPageLoader';
import { paths } from './utils/paths';

// Signed-in pages load on demand so the landing and auth screens stay small.
const Start = lazy(() => import('./pages/candidate/Start'));
const Dashboard = lazy(() => import('./pages/candidate/Dashboard'));
const Resume = lazy(() => import('./pages/candidate/Resume'));
const NewInterview = lazy(() => import('./pages/candidate/NewInterview'));
const InterviewSession = lazy(() => import('./pages/candidate/InterviewSession'));
const InterviewReport = lazy(() => import('./pages/candidate/InterviewReport'));
const InterviewHistory = lazy(() => import('./pages/candidate/InterviewHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies'));
const AdminCompanyDetail = lazy(() => import('./pages/admin/AdminCompanyDetail'));
const BlueprintEditor = lazy(() => import('./pages/admin/BlueprintEditor'));
const AdminPatterns = lazy(() => import('./pages/admin/AdminPatterns'));
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'));
const AdminStatistics = lazy(() => import('./pages/admin/AdminStatistics'));

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path={paths.home} element={<Landing />} />

        <Route element={<AuthLayout />}>
          <Route element={<GuestOnly />}>
            <Route path={paths.login} element={<Login />} />
            <Route path={paths.register} element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<FocusLayout />}>
            <Route path={paths.start} element={<Start />} />
            <Route path={paths.newInterview} element={<NewInterview />} />
          </Route>
          <Route element={<CandidateLayout />}>
            <Route path={paths.dashboard} element={<Dashboard />} />
            <Route path={paths.resume} element={<Resume />} />
            <Route path={paths.interviewHistory} element={<InterviewHistory />} />
            <Route path="/interviews/:interviewId/report" element={<InterviewReport />} />
          </Route>
          {/* The interview itself is full-screen, without the app sidebar */}
          <Route path="/interviews/:interviewId" element={<InterviewSession />} />
          <Route element={<AccountLayout />}>
            <Route path={paths.settings} element={<Settings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path={paths.admin} element={<AdminOverview />} />
            <Route path={paths.adminUsers} element={<Users />} />
            <Route path={paths.adminCompanies} element={<AdminCompanies />} />
            <Route path="/admin/companies/:companyId" element={<AdminCompanyDetail />} />
            <Route path="/admin/companies/:companyId/roles/:blueprintId" element={<BlueprintEditor />} />
            <Route path={paths.adminPatterns} element={<AdminPatterns />} />
            <Route path={paths.adminQuestions} element={<AdminQuestions />} />
            <Route path={paths.adminStatistics} element={<AdminStatistics />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
