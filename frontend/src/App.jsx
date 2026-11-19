import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { GuestOnly } from './components/routing/GuestOnly';
import { RequireAuth } from './components/routing/RequireAuth';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { CandidateLayout } from './layouts/CandidateLayout';
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { FullPageLoader } from './components/ui/FullPageLoader';
import { paths } from './utils/paths';

// Signed-in pages load on demand so the landing and auth screens stay small.
const Dashboard = lazy(() => import('./pages/candidate/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const Users = lazy(() => import('./pages/admin/Users'));

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
          <Route element={<CandidateLayout />}>
            <Route path={paths.dashboard} element={<Dashboard />} />
          </Route>
          <Route element={<AccountLayout />}>
            <Route path={paths.settings} element={<Settings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path={paths.admin} element={<AdminOverview />} />
            <Route path={paths.adminUsers} element={<Users />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
