import { useState, useEffect, type FormEvent } from 'react';
import type { TimelineEvent, Region, Category, Tag, EventFormState } from '../types';
import { eventsApi } from '../api/events';
import { regionsApi } from '../api/regions';
import { categoriesApi } from '../api/categories';
import { tagsApi } from '../api/tags';
import { CreatableMultiSelect } from './CreatableMultiSelect';

interface Props {
  event: TimelineEvent | null;
  regions: Region[];
  categories: Category[];
  tags: Tag[];
  onSaved: (event: TimelineEvent) => void;
  onClose: () => void;
  onRegionCreated: (r: Region) => void;
  onCategoryCreated: (c: Category) => void;
  onTagCreated: (t: Tag) => void;
}

function emptyForm(): EventFormState {
  return {
    title: '', event_type: 'point',
    start_year: '', start_month: '', start_day: '', start_circa: false,
    end_year: '', end_month: '', end_day: '', end_circa: false,
    narrative: '', region_ids: [], category_ids: [], tag_ids: [],
  };
}

function eventToForm(e: TimelineEvent): EventFormState {
  return {
    title: e.title,
    event_type: e.event_type,
    start_year: String(e.start_year),
    start_month: e.start_month != null ? String(e.start_month) : '',
    start_day: e.start_day != null ? String(e.start_day) : '',
    start_circa: e.start_circa,
    end_year: e.end_year != null ? String(e.end_year) : '',
    end_month: e.end_month != null ? String(e.end_month) : '',
    end_day: e.end_day != null ? String(e.end_day) : '',
    end_circa: e.end_circa,
    narrative: e.narrative ?? '',
    region_ids: e.regions.map(r => r.id),
    category_ids: e.categories.map(c => c.id),
    tag_ids: e.tags.map(t => t.id),
  };
}

function formToPayload(f: EventFormState) {
  return {
    title: f.title,
    event_type: f.event_type,
    start_year: Number(f.start_year),
    start_month: f.start_month ? Number(f.start_month) : null,
    start_day: f.start_day ? Number(f.start_day) : null,
    start_circa: f.start_circa,
    end_year: f.end_year ? Number(f.end_year) : null,
    end_month: f.end_month ? Number(f.end_month) : null,
    end_day: f.end_day ? Number(f.end_day) : null,
    end_circa: f.end_circa,
    narrative: f.narrative.trim() || null,
    region_ids: f.region_ids,
    category_ids: f.category_ids,
    tag_ids: f.tag_ids,
  };
}

export function EventModal({
  event, regions, categories, tags,
  onSaved, onClose, onRegionCreated, onCategoryCreated, onTagCreated,
}: Props) {
  const [form, setForm] = useState<EventFormState>(event ? eventToForm(event) : emptyForm());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof EventFormState>(key: K, value: EventFormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.start_year) { setError('Start year is required.'); return; }
    if (form.event_type === 'range' && !form.end_year) {
      setError('End year is required for range events.'); return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = formToPayload(form);
      const saved = event
        ? await eventsApi.update(event.id, payload)
        : await eventsApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <div className="radio-group">
              {(['point', 'range'] as const).map(t => (
                <label key={t} className="radio-label">
                  <input
                    type="radio"
                    value={t}
                    checked={form.event_type === t}
                    onChange={() => set('event_type', t)}
                  />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <fieldset className="date-fieldset">
            <legend>Start date *</legend>
            <div className="date-row">
              <div className="form-group">
                <label htmlFor="start_year">Year</label>
                <input
                  id="start_year"
                  type="number"
                  value={form.start_year}
                  onChange={e => set('start_year', e.target.value)}
                  placeholder="e.g. −44"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="start_month">Month</label>
                <input
                  id="start_month"
                  type="number"
                  value={form.start_month}
                  onChange={e => set('start_month', e.target.value)}
                  min={1} max={12}
                  placeholder="1–12"
                />
              </div>
              <div className="form-group">
                <label htmlFor="start_day">Day</label>
                <input
                  id="start_day"
                  type="number"
                  value={form.start_day}
                  onChange={e => set('start_day', e.target.value)}
                  min={1} max={31}
                  placeholder="1–31"
                />
              </div>
              <div className="form-group form-group-check">
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={form.start_circa}
                    onChange={e => set('start_circa', e.target.checked)}
                  />
                  Circa
                </label>
              </div>
            </div>
          </fieldset>

          {form.event_type === 'range' && (
            <fieldset className="date-fieldset">
              <legend>End date *</legend>
              <div className="date-row">
                <div className="form-group">
                  <label htmlFor="end_year">Year</label>
                  <input
                    id="end_year"
                    type="number"
                    value={form.end_year}
                    onChange={e => set('end_year', e.target.value)}
                    placeholder="e.g. 1453"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_month">Month</label>
                  <input
                    id="end_month"
                    type="number"
                    value={form.end_month}
                    onChange={e => set('end_month', e.target.value)}
                    min={1} max={12}
                    placeholder="1–12"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_day">Day</label>
                  <input
                    id="end_day"
                    type="number"
                    value={form.end_day}
                    onChange={e => set('end_day', e.target.value)}
                    min={1} max={31}
                    placeholder="1–31"
                  />
                </div>
                <div className="form-group form-group-check">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={form.end_circa}
                      onChange={e => set('end_circa', e.target.checked)}
                    />
                    Circa
                  </label>
                </div>
              </div>
            </fieldset>
          )}

          <div className="form-group">
            <label htmlFor="narrative">Narrative</label>
            <textarea
              id="narrative"
              value={form.narrative}
              onChange={e => set('narrative', e.target.value)}
              rows={4}
              placeholder="Optional description…"
            />
          </div>

          <CreatableMultiSelect
            label="Geographic Regions"
            options={regions}
            selected={form.region_ids}
            onChange={ids => set('region_ids', ids)}
            onCreate={async name => {
              const r = await regionsApi.create(name);
              onRegionCreated(r);
              return r;
            }}
            placeholder="Search or create a region…"
          />

          <CreatableMultiSelect
            label="Thematic Categories"
            options={categories}
            selected={form.category_ids}
            onChange={ids => set('category_ids', ids)}
            onCreate={async name => {
              const c = await categoriesApi.create(name);
              onCategoryCreated(c);
              return c;
            }}
            placeholder="Search or create a category…"
          />

          <CreatableMultiSelect
            label="Custom Tags"
            options={tags}
            selected={form.tag_ids}
            onChange={ids => set('tag_ids', ids)}
            onCreate={async name => {
              const t = await tagsApi.create(name);
              onTagCreated(t);
              return t;
            }}
            placeholder="Search or create a tag…"
          />

          {error && <p className="field-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : event ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
