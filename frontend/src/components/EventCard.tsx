import type { TimelineEvent } from '../types';

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
}

function formatDate(
  year: number,
  month: number | null,
  day: number | null,
  circa: boolean,
): string {
  const parts: string[] = [];
  if (circa) parts.push('c.');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (day && month) parts.push(`${day} ${months[month - 1]}`);
  else if (month) parts.push(months[month - 1]);
  parts.push(formatYear(year));
  return parts.join(' ');
}

interface Props {
  event: TimelineEvent;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventCard({ event, onEdit, onDelete }: Props) {
  const startLabel = formatDate(
    event.start_year, event.start_month, event.start_day, event.start_circa,
  );
  const endLabel = event.end_year != null
    ? formatDate(event.end_year, event.end_month, event.end_day, event.end_circa)
    : null;

  return (
    <div className="event-card">
      <div className="event-card-header">
        <div className="event-card-title-row">
          <h3 className="event-card-title">{event.title}</h3>
          <span className={`badge badge-${event.event_type}`}>{event.event_type}</span>
        </div>
        <div className="event-card-actions">
          <button className="btn btn-sm" onClick={onEdit}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={onDelete}>Delete</button>
        </div>
      </div>

      <p className="event-card-date">
        {endLabel ? `${startLabel} – ${endLabel}` : startLabel}
      </p>

      {event.narrative && (
        <p className="event-card-narrative">{event.narrative}</p>
      )}

      <div className="event-card-tags">
        {event.regions.map(r => (
          <span key={r.id} className="chip chip-region">{r.name}</span>
        ))}
        {event.categories.map(c => (
          <span key={c.id} className="chip chip-category">{c.name}</span>
        ))}
        {event.tags.map(t => (
          <span key={t.id} className="chip chip-tag">{t.name}</span>
        ))}
      </div>
    </div>
  );
}
