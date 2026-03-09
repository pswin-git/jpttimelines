import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import html2canvas from 'html2canvas';
import { toSvg } from 'html-to-image';
import type { TimelineEvent, Region, Category } from '../types';
import { TimelinePopover } from './TimelinePopover';
import {
  yearToDate, formatMinorLabel, formatMajorLabel,
  buildTimelineData, buildColorMap,
  CAT_PALETTE, REG_PALETTE,
  type GroupBy, type ColorBy,
} from '../utils/timelineUtils';

interface Props {
  events: TimelineEvent[];
  regions: Region[];
  categories: Category[];
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function TimelineView({ events, regions, categories }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const exportRef     = useRef<HTMLDivElement>(null);
  const timelineRef   = useRef<InstanceType<typeof Timeline> | null>(null);

  const eventsRef = useRef(events);
  useEffect(() => { eventsRef.current = events; }, [events]);

  const [groupBy,    setGroupBy]   = useState<GroupBy>('none');
  const [colorBy,    setColorBy]   = useState<ColorBy>('category');
  const [popover,    setPopover]   = useState<{ event: TimelineEvent; x: number; y: number } | null>(null);
  const [exporting,  setExporting] = useState<'png' | 'svg' | null>(null);

  const fittedRef = useRef(false);

  // ── Initialize vis-timeline once ─────────────────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const tl = new Timeline(
      containerRef.current,
      [],
      {
        orientation:     { axis: 'top' },
        stack:           true,
        moveable:        true,
        zoomable:        true,
        zoomMin:         MS_PER_YEAR * 10,
        zoomMax:         MS_PER_YEAR * 15000,
        start:           yearToDate(-600),
        end:             yearToDate(2100),
        minHeight:       200,
        showCurrentTime: false,
        tooltip:         { followMouse: false, overflowMethod: 'cap' },
        format: {
          minorLabels: formatMinorLabel,
          majorLabels: formatMajorLabel,
        },
      },
    );

    tl.on('click', (props: Record<string, unknown>) => {
      if (!props.item) { setPopover(null); return; }
      const itemId  = String(props.item);
      const eventId = parseInt(itemId.split('-')[1], 10);
      const found   = eventsRef.current.find(e => e.id === eventId);
      if (!found) return;
      const domEvent = props.event as MouseEvent | undefined;
      setPopover({ event: found, x: domEvent?.pageX ?? 0, y: domEvent?.pageY ?? 0 });
    });

    tl.addCustomTime(yearToDate(1), 'bce-ce');

    timelineRef.current = tl;
    return () => { tl.destroy(); timelineRef.current = null; fittedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild items / groups whenever data or view settings change ──────────
  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;

    const catColorMap = buildColorMap(
      [...categories].sort((a, b) => a.id - b.id).map(c => c.id), CAT_PALETTE,
    );
    const regColorMap = buildColorMap(
      [...regions].sort((a, b) => a.id - b.id).map(r => r.id), REG_PALETTE,
    );

    const { items, groups } = buildTimelineData(
      events, groupBy, colorBy, regions, categories, catColorMap, regColorMap,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tl.setGroups((groups.length ? groups : null) as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tl.setItems(items as any);

    if (events.length > 0 && !fittedRef.current) {
      fittedRef.current = true;
      const minYear = Math.min(...events.map(e => e.start_year));
      const maxYear = Math.max(...events.map(e => e.end_year ?? e.start_year));
      const pad     = Math.max(50, (maxYear - minYear) * 0.05);
      tl.setWindow(yearToDate(minYear - pad), yearToDate(maxYear + pad), { animation: false });
    }
  }, [events, groupBy, colorBy, regions, categories]);

  // ── Fit button ────────────────────────────────────────────────────────────
  function fitAll() {
    if (!timelineRef.current || events.length === 0) return;
    const minYear = Math.min(...events.map(e => e.start_year));
    const maxYear = Math.max(...events.map(e => e.end_year ?? e.start_year));
    const pad     = Math.max(50, (maxYear - minYear) * 0.05);
    timelineRef.current.setWindow(
      yearToDate(minYear - pad), yearToDate(maxYear + pad),
      { animation: { duration: 400, easingFunction: 'easeInOutQuad' } },
    );
  }

  // ── Export ────────────────────────────────────────────────────────────────
  async function exportPng() {
    if (!exportRef.current || exporting) return;
    setExporting('png');
    try {
      const canvas = await html2canvas(exportRef.current, { backgroundColor: '#0f1117', scale: 2 });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'timeline.png';
      a.click();
    } catch (e) {
      console.error('PNG export failed', e);
    } finally {
      setExporting(null);
    }
  }

  async function exportSvg() {
    if (!exportRef.current || exporting) return;
    setExporting('svg');
    try {
      const dataUrl = await toSvg(exportRef.current, { backgroundColor: '#0f1117' });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'timeline.svg';
      a.click();
    } catch (e) {
      console.error('SVG export failed', e);
    } finally {
      setExporting(null);
    }
  }

  // ── Legend ────────────────────────────────────────────────────────────────
  const legendItems = colorBy === 'category'
    ? [...categories].sort((a, b) => a.id - b.id).slice(0, 10).map((c, i) => ({
        label: c.name, color: CAT_PALETTE[i % CAT_PALETTE.length],
      }))
    : [...regions].sort((a, b) => a.id - b.id).slice(0, 14).map((r, i) => ({
        label: r.name, color: REG_PALETTE[i % REG_PALETTE.length],
      }));

  return (
    <div className="tl-shell">

      {/* ── Controls ── */}
      <div className="tl-controls">
        <div className="tl-control-group">
          <span className="tl-control-label">View</span>
          <div className="tl-btn-group">
            {(['none', 'region', 'category'] as GroupBy[]).map(g => (
              <button
                key={g}
                className={`btn btn-sm ${groupBy === g ? 'btn-primary' : ''}`}
                onClick={() => { setGroupBy(g); fittedRef.current = false; }}
              >
                {g === 'none' ? 'Linear' : g === 'region' ? 'By region' : 'By category'}
              </button>
            ))}
          </div>
        </div>

        <div className="tl-control-group">
          <span className="tl-control-label">Color by</span>
          <div className="tl-btn-group">
            {(['category', 'region'] as ColorBy[]).map(c => (
              <button
                key={c}
                className={`btn btn-sm ${colorBy === c ? 'btn-primary' : ''}`}
                onClick={() => setColorBy(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-sm" onClick={fitAll} disabled={events.length === 0}>
          Fit all
        </button>

        <div className="tl-export-group">
          <span className="tl-control-label">Export</span>
          <button
            className="btn btn-sm"
            onClick={exportPng}
            disabled={!!exporting || events.length === 0}
            title="Export as PNG image"
          >
            {exporting === 'png' ? 'Saving…' : 'PNG'}
          </button>
          <button
            className="btn btn-sm"
            onClick={exportSvg}
            disabled={!!exporting || events.length === 0}
            title="Export as SVG"
          >
            {exporting === 'svg' ? 'Saving…' : 'SVG'}
          </button>
        </div>
      </div>

      {/* ── Exportable area: canvas + legend ── */}
      <div ref={exportRef}>
        <div className="tl-canvas-wrap">
          {events.length === 0
            ? (
              <div className="tl-empty">
                <p>No events match the current filters.</p>
              </div>
            )
            : <div ref={containerRef} className="tl-canvas" />
          }
        </div>

        {legendItems.length > 0 && (
          <div className="tl-legend">
            <span className="tl-control-label">
              Color = {colorBy === 'category' ? 'category' : 'region'}
            </span>
            <div className="tl-legend-items">
              {legendItems.map(({ label, color }) => (
                <span key={label} className="tl-legend-item">
                  <span className="tl-legend-dot" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
            <span className="tl-circa-note">* approximate date</span>
          </div>
        )}
      </div>

      {popover && (
        <TimelinePopover
          event={popover.event}
          x={popover.x}
          y={popover.y}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
