import { API_BASE_URL } from '../config/env';

type ApiRequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data));
  }

  return data as TResponse;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return 'Request failed. Try again.';
  }

  const message = (data as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  return typeof message === 'string' ? message : 'Request failed. Try again.';
}
