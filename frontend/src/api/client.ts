const BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(t: string): void {
  localStorage.setItem('token', t);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    return null as T;
  }

  if (res.status === 204) return null as T;

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path: string) => request<void>(path, { method: 'DELETE' }),
};
