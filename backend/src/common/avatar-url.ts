export function buildAvatarUrl(avatarPath: string | null): string | null {
  if (!avatarPath) {
    return null;
  }

  if (/^https?:\/\//i.test(avatarPath)) {
    return avatarPath;
  }

  const publicUrl = (process.env.BACKEND_PUBLIC_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  return `${publicUrl}/${avatarPath.replace(/^\/+/, '')}`;
}
