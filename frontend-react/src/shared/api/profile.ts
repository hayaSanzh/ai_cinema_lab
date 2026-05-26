import { apiRequest } from './http';
import type { User } from '../types/user';

export type PublicProfile = User & {
  updatedAt: string;
};

export function getProfile(token: string) {
  return apiRequest<PublicProfile>('/users/me', {
    token,
  });
}

export function updateProfile(token: string, name: string) {
  return apiRequest<PublicProfile>('/users/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ name }),
  });
}

export function uploadAvatar(token: string, file: File) {
  const formData = new FormData();

  formData.append('avatar', file);

  return apiRequest<PublicProfile>('/users/me/avatar', {
    method: 'POST',
    token,
    body: formData,
  });
}
