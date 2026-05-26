import { apiRequest } from './http';
import type { AuthResponse } from '../types/user';

type AuthPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export function registerUser(payload: AuthPayload & { name: string }) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: AuthPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
