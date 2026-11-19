import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { homePathFor } from '../../utils/paths';
import { FullPageLoader } from '../ui/FullPageLoader';

/** Renders child routes only for signed-in users (optionally limited to certain roles). */
export function RequireAuth({ roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user)} replace />;

  return <Outlet />;
}
