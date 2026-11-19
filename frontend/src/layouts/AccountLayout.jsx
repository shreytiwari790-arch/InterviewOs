import { useAuth } from '../hooks/useAuth';
import { AdminLayout } from './AdminLayout';
import { CandidateLayout } from './CandidateLayout';

/** Shared pages such as Settings render inside the layout that matches the user's role. */
export function AccountLayout() {
  const { user } = useAuth();
  return user.role === 'admin' ? <AdminLayout /> : <CandidateLayout />;
}
