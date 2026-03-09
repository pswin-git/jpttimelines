export type EventType = 'point' | 'range';

export interface Region { id: number; name: string; }
export interface Category { id: number; name: string; }
export interface Tag { id: number; name: string; }

export interface TimelineEvent {
  id: number;
  title: string;
  event_type: EventType;
  start_year: number;
  start_month: number | null;
  start_day: number | null;
  start_circa: boolean;
  end_year: number | null;
  end_month: number | null;
  end_day: number | null;
  end_circa: boolean;
  narrative: string | null;
  created_at: string;
  updated_at: string;
  regions: Region[];
  categories: Category[];
  tags: Tag[];
}

export interface Filters {
  search: string;
  start_year: string;
  end_year: string;
  region_ids: number[];
  category_ids: number[];
  tag_ids: number[];
}

export interface EventFormState {
  title: string;
  event_type: EventType;
  start_year: string;
  start_month: string;
  start_day: string;
  start_circa: boolean;
  end_year: string;
  end_month: string;
  end_day: string;
  end_circa: boolean;
  narrative: string;
  region_ids: number[];
  category_ids: number[];
  tag_ids: number[];
}
