import { createContext } from 'react';
import type { User } from '../types/user';
import type { StoredSession } from './auth-storage';

export type AuthContextValue = {
  session: StoredSession | null;
  isAuthenticated: boolean;
  signIn: (token: string, user: User, rememberMe: boolean) => void;
  updateUser: (user: User) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
