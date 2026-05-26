const explicitApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const localHosts = new Set(['localhost', '127.0.0.1', '']);
const isLocalBrowser =
  typeof window !== 'undefined' && localHosts.has(window.location.hostname);

export const API_BASE_URL =
  explicitApiUrl ?? (isLocalBrowser ? 'http://localhost:3000/api' : '/api');

export const LEGACY_SITE_URL = import.meta.env.VITE_LEGACY_SITE_URL ?? 'http://localhost:8000';
