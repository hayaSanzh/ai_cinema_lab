import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
  updateStoredUser,
  type StoredSession,
} from './auth-storage';
import type { User } from '../types/user';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());

  const signIn = useCallback((token: string, user: User, rememberMe: boolean) => {
    saveStoredSession(token, user, rememberMe);
    setSession({ token, user, rememberMe });
  }, []);

  const updateUser = useCallback((user: User) => {
    updateStoredUser(user);
    setSession((currentSession) => (currentSession ? { ...currentSession, user } : currentSession));
  }, []);

  const signOut = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      signIn,
      updateUser,
      signOut,
    }),
    [session, signIn, updateUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
