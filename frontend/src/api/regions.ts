import { api } from './client';
import type { Region } from '../types';

export const regionsApi = {
  list: () => api.get<Region[]>('/regions/'),
  create: (name: string) => api.post<Region>('/regions/', { name }),
};
