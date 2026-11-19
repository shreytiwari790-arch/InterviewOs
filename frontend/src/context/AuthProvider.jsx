import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import { authService } from '../services/authService';

// AuthProvider wraps the app and makes the current user available to all child components via AuthContext.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, fetch the logged-in user from the backend using the session cookie.
  useEffect(() => {
    authService
      .getCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { user } = await authService.login(credentials);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (details) => {
    const { user } = await authService.register(details);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {});
    setUser(null);
  }, []);

  // Memoised context value prevents unnecessary re-renders of consuming components.
  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, register, logout, setUser }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
