import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { homePathFor } from '../../utils/paths';
import { FullPageLoader } from '../ui/FullPageLoader';

/** Keeps signed-in users away from login and registration screens. */
export function GuestOnly() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (user) return <Navigate to={homePathFor(user)} replace />;

  return <Outlet />;
}
