import { useState, useEffect, useCallback } from 'react';
import { getToken, clearToken } from './api/client';
import { eventsApi } from './api/events';
import { regionsApi } from './api/regions';
import { categoriesApi } from './api/categories';
import { tagsApi } from './api/tags';
import { LoginScreen } from './components/LoginScreen';
import { EventCard } from './components/EventCard';
import { EventModal } from './components/EventModal';
import { FilterSidebar } from './components/FilterSidebar';
import { TimelineView } from './components/TimelineView';
import type { TimelineEvent, Region, Category, Tag, Filters } from './types';

type ViewMode = 'list' | 'timeline';

const EMPTY_FILTERS: Filters = {
  search: '', start_year: '', end_year: '',
  region_ids: [], category_ids: [], tag_ids: [],
};

function App() {
  const [token, setToken] = useState<string | null>(getToken());
  if (!token) return <LoginScreen onLogin={() => setToken(getToken())} />;
  return <MainView onLogout={() => { clearToken(); setToken(null); }} />;
}

function MainView({ onLogout }: { onLogout: () => void }) {
  const [events,      setEvents]      = useState<TimelineEvent[]>([]);
  const [regions,     setRegions]     = useState<Region[]>([]);
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [tags,        setTags]        = useState<Tag[]>([]);
  const [filters,     setFilters]     = useState<Filters>(EMPTY_FILTERS);
  const [loading,     setLoading]     = useState(false);
  const [fetchError,  setFetchError]  = useState('');
  const [view,        setView]        = useState<ViewMode>('list');
  const [modalEvent,  setModalEvent]  = useState<TimelineEvent | null | 'new'>(null);
  const [deleteTarget,setDeleteTarget]= useState<TimelineEvent | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([regionsApi.list(), categoriesApi.list(), tagsApi.list()])
      .then(([r, c, t]) => { setRegions(r); setCategories(c); setTags(t); })
      .catch(() => {});
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try   { setEvents(await eventsApi.list(filters)); }
    catch (err) { setFetchError(err instanceof Error ? err.message : 'Failed to load events.'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Close mobile sidebar when switching views
  useEffect(() => { setSidebarOpen(false); }, [view]);

  function handleSaved(saved: TimelineEvent) {
    setEvents(prev => {
      const exists = prev.some(e => e.id === saved.id);
      return exists ? prev.map(e => e.id === saved.id ? saved : e) : [saved, ...prev];
    });
    setModalEvent(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eventsApi.delete(deleteTarget.id);
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    } finally { setDeleting(false); }
  }

  function addSorted<T extends { name: string }>(list: T[], item: T): T[] {
    return [...list, item].sort((a, b) => a.name.localeCompare(b.name));
  }

  const hasFilters =
    filters.search || filters.start_year || filters.end_year ||
    filters.region_ids.length || filters.category_ids.length || filters.tag_ids.length;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">JPT Timelines</h1>
        <div className="app-header-actions">

          {/* Mobile filter toggle */}
          <button
            className={`btn btn-sm mobile-filter-btn ${sidebarOpen ? 'btn-primary' : ''}`}
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle filters"
          >
            {hasFilters ? '⚙ Filters ●' : '⚙ Filters'}
          </button>

          {/* View toggle */}
          <div className="tl-btn-group">
            <button
              className={`btn btn-sm ${view === 'list' ? 'btn-primary' : ''}`}
              onClick={() => setView('list')}
            >
              ☰ List
            </button>
            <button
              className={`btn btn-sm ${view === 'timeline' ? 'btn-primary' : ''}`}
              onClick={() => setView('timeline')}
            >
              ▬ Timeline
            </button>
          </div>

          <button className="btn btn-primary btn-new-event" onClick={() => setModalEvent('new')}>
            + New Event
          </button>
          <button className="btn-link" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className={`app-body ${view === 'timeline' ? 'app-body--timeline' : ''}`}>
        <FilterSidebar
          filters={filters}
          onChange={f => { setFilters(f); setSidebarOpen(false); }}
          regions={regions}
          categories={categories}
          tags={tags}
          onClear={() => { setFilters(EMPTY_FILTERS); setSidebarOpen(false); }}
          mobileOpen={sidebarOpen}
        />

        {view === 'list' ? (
          <main className="event-list">
            {loading && (
              <div className="status-loading">
                <span className="spinner" />
                Loading events…
              </div>
            )}
            {!loading && fetchError && (
              <div className="status-error-box">
                <strong>Failed to load events</strong>
                <p>{fetchError}</p>
                <button className="btn btn-sm" onClick={loadEvents}>Retry</button>
              </div>
            )}
            {!loading && !fetchError && events.length === 0 && (
              <div className="empty-state">
                {hasFilters
                  ? <>
                      <p>No events match the current filters.</p>
                      <button className="btn" onClick={() => setFilters(EMPTY_FILTERS)}>
                        Clear filters
                      </button>
                    </>
                  : <>
                      <p>No events yet.</p>
                      <button className="btn btn-primary" onClick={() => setModalEvent('new')}>
                        Create the first one
                      </button>
                    </>
                }
              </div>
            )}
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => setModalEvent(event)}
                onDelete={() => setDeleteTarget(event)}
              />
            ))}
          </main>
        ) : (
          <div className="timeline-pane">
            {loading && (
              <div className="status-loading">
                <span className="spinner" />
                Loading events…
              </div>
            )}
            {!loading && fetchError && (
              <div className="status-error-box">
                <strong>Failed to load events</strong>
                <p>{fetchError}</p>
                <button className="btn btn-sm" onClick={loadEvents}>Retry</button>
              </div>
            )}
            {!loading && !fetchError && (
              <TimelineView
                events={events}
                regions={regions}
                categories={categories}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal modal-sm">
            <div className="modal-header"><h2>Delete event?</h2></div>
            <div className="modal-body">
              <p>"<strong>{deleteTarget.title}</strong>" will be permanently deleted.</p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / edit modal */}
      {modalEvent != null && (
        <EventModal
          event={modalEvent === 'new' ? null : modalEvent}
          regions={regions}
          categories={categories}
          tags={tags}
          onSaved={handleSaved}
          onClose={() => setModalEvent(null)}
          onRegionCreated={r => setRegions(prev => addSorted(prev, r))}
          onCategoryCreated={c => setCategories(prev => addSorted(prev, c))}
          onTagCreated={t => setTags(prev => addSorted(prev, t))}
        />
      )}
    </div>
  );
}

export default App;
