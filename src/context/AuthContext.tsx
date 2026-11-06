import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentUser, login as apiLogin } from '../api/auth';
import { ApiError, setUnauthorizedHandler, tokenStore } from '../api/client';
import type { User, UserRole } from '../types/api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** One-off message to show on the login page, such as an expired-session notice. */
  notice: string | null;
  clearNotice: () => void;
  login: (email: string, password: string, requiredRole?: UserRole) => Promise<User>;
  logout: () => void;
}

const ADMIN_ONLY_MESSAGE =
  'This account does not have administrator access. Please use the user login page.';
const EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStore.get() ? 'loading' : 'unauthenticated'));
  const [notice, setNotice] = useState<string | null>(null);

  // A 401 on any authenticated request ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      setNotice(EXPIRED_MESSAGE);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Restore the session after a refresh by validating the token with GET /auth/me.
  useEffect(() => {
    if (!tokenStore.get()) return;
    let active = true;
    getCurrentUser()
      .then((me) => {
        if (!active) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const apiError = error instanceof ApiError ? error : null;
        // 401 is handled by the interceptor (token cleared). For outages keep the token so a reload can retry.
        if (apiError && apiError.status !== 401) setNotice(apiError.message);
        setUser(null);
        setStatus('unauthenticated');
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, requiredRole?: UserRole) => {
    setNotice(null);
    try {
      const tokens = await apiLogin({ email, password });
      tokenStore.set(tokens.access_token); // refresh_token is deliberately discarded
      const me = await getCurrentUser();
      if (requiredRole && me.role !== requiredRole) {
        throw new ApiError({
          message: requiredRole === 'admin' ? ADMIN_ONLY_MESSAGE : 'This account does not have user access.',
          status: 403,
        });
      }
      setUser(me);
      setStatus('authenticated');
      return me;
    } catch (error) {
      tokenStore.clear();
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('unauthenticated');
    setNotice(null);
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({ user, status, notice, clearNotice, login, logout }),
    [user, status, notice, clearNotice, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
