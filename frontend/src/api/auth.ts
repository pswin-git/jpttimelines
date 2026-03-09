import { api, setToken } from './client';

export async function login(password: string): Promise<void> {
  const data = await api.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    { password },
  );
  setToken(data.access_token);
}
