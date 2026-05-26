import type { User } from '../types/user';

const TOKEN_KEY = 'aiforge.accessToken';
const USER_KEY = 'aiforge.user';

export type StoredSession = {
  token: string;
  user: User;
  rememberMe: boolean;
};

export function readStoredSession(): StoredSession | null {
  const localSession = readFromStorage(localStorage, true);

  if (localSession) {
    return localSession;
  }

  return readFromStorage(sessionStorage, false);
}

export function saveStoredSession(token: string, user: User, rememberMe: boolean) {
  const storage = rememberMe ? localStorage : sessionStorage;

  clearStoredSession();
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user: User) {
  const session = readStoredSession();

  if (!session) {
    return;
  }

  const storage = session.rememberMe ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function readFromStorage(storage: Storage, rememberMe: boolean): StoredSession | null {
  const token = storage.getItem(TOKEN_KEY);
  const userJson = storage.getItem(USER_KEY);

  if (!token || !userJson) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userJson) as User,
      rememberMe,
    };
  } catch {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    return null;
  }
}
