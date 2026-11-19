import { useAuth } from './useAuth';
import { paths } from '../utils/paths';

/** Where "get started" buttons lead: sign-up for visitors, the guided interview setup for signed-in candidates. */
export function useStartCta(guestLabel = 'Try now for free') {
  const { user } = useAuth();
  if (!user) return { to: paths.register, label: guestLabel, isSignedIn: false };
  return { to: user.role === 'admin' ? paths.admin : paths.newInterview, label: 'Get started', isSignedIn: true };
}
