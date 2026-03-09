import { useEffect, useRef } from 'react';
import type { TimelineEvent } from '../types';
import { formatEventDate } from '../utils/timelineUtils';

interface Props {
  event: TimelineEvent;
  x: number;
  y: number;
  onClose: () => void;
}

export function TimelinePopover({ event, x, y, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const startLabel = formatEventDate(
    event.start_year, event.start_month, event.start_day, event.start_circa,
  );
  const endLabel = event.end_year != null
    ? formatEventDate(event.end_year, event.end_month, event.end_day, event.end_circa)
    : null;

  // Keep popover within the viewport
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const popW  = 320;
  const popH  = 300; // estimated max height
  const left  = Math.min(x + 12, viewW - popW - 12);
  const top   = Math.min(y + 12, viewH - popH - 12);

  return (
    <div
      ref={ref}
      className="tl-popover"
      style={{ position: 'fixed', left, top, zIndex: 500 }}
    >
      <div className="tl-popover-header">
        <div>
          <h3 className="tl-popover-title">{event.title}</h3>
          <p className="tl-popover-date">
            {endLabel ? `${startLabel} – ${endLabel}` : startLabel}
            <span className={`badge badge-${event.event_type}`}>{event.event_type}</span>
          </p>
        </div>
        <button className="tl-popover-close" onClick={onClose}>×</button>
      </div>

      {event.narrative && (
        <p className="tl-popover-narrative">{event.narrative}</p>
      )}

      {event.regions.length > 0 && (
        <div className="tl-popover-section">
          <span className="tl-section-label">Regions</span>
          <div className="tl-chips">
            {event.regions.map(r => (
              <span key={r.id} className="chip chip-region">{r.name}</span>
            ))}
          </div>
        </div>
      )}

      {event.categories.length > 0 && (
        <div className="tl-popover-section">
          <span className="tl-section-label">Categories</span>
          <div className="tl-chips">
            {event.categories.map(c => (
              <span key={c.id} className="chip chip-category">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      {event.tags.length > 0 && (
        <div className="tl-popover-section">
          <span className="tl-section-label">Tags</span>
          <div className="tl-chips">
            {event.tags.map(t => (
              <span key={t.id} className="chip chip-tag">{t.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
