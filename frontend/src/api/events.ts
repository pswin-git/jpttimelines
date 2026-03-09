import { api } from './client';
import type { Filters, TimelineEvent } from '../types';

function buildQuery(filters: Filters): string {
  const p = new URLSearchParams();
  if (filters.search) p.set('search', filters.search);
  if (filters.start_year) p.set('start_year', filters.start_year);
  if (filters.end_year) p.set('end_year', filters.end_year);
  filters.region_ids.forEach(id => p.append('region_ids', String(id)));
  filters.category_ids.forEach(id => p.append('category_ids', String(id)));
  filters.tag_ids.forEach(id => p.append('tag_ids', String(id)));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export const eventsApi = {
  list: (filters: Filters) =>
    api.get<TimelineEvent[]>(`/events/${buildQuery(filters)}`),
  create: (data: unknown) =>
    api.post<TimelineEvent>('/events/', data),
  update: (id: number, data: unknown) =>
    api.put<TimelineEvent>(`/events/${id}`, data),
  delete: (id: number) =>
    api.del(`/events/${id}`),
};
