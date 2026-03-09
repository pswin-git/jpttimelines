import type { TimelineEvent, Category, Region } from '../types';

// ─── BCE date handling ───────────────────────────────────────────────────────
// JavaScript Date objects don't support BCE years natively. We shift all years
// by YEAR_OFFSET so that -4000 BCE becomes internal year 1001, well within the
// safe range for Date arithmetic that vis-timeline relies on.
export const YEAR_OFFSET = 5001;

export function yearToDate(year: number, month = 1, day = 1): Date {
  const d = new Date(0);
  d.setFullYear(year + YEAR_OFFSET, month - 1, Math.max(1, day));
  return d;
}

export function internalYearToDisplay(internalYear: number): number {
  return internalYear - YEAR_OFFSET;
}

export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return '1 BCE'; // astronomical year 0 = historical 1 BCE
  return `${year} CE`;
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatEventDate(
  year: number,
  month: number | null,
  day: number | null,
  circa: boolean,
): string {
  const parts: string[] = [];
  if (circa) parts.push('c.');
  if (day && month) parts.push(`${day} ${MONTH_SHORT[month - 1]}`);
  else if (month) parts.push(MONTH_SHORT[month - 1]);
  parts.push(formatYear(year));
  return parts.join(' ');
}

// ─── vis-timeline axis label formatters ─────────────────────────────────────
export function formatMinorLabel(date: Date, scale: string): string {
  const year = internalYearToDisplay(date.getFullYear());
  switch (scale) {
    case 'year':    return formatYear(year);
    case 'month':   return MONTH_SHORT[date.getMonth()];
    case 'day':
    case 'weekday': return String(date.getDate());
    default:        return '';
  }
}

export function formatMajorLabel(date: Date, scale: string): string {
  const year = internalYearToDisplay(date.getFullYear());
  switch (scale) {
    case 'day':
    case 'weekday':
    case 'month': return `${MONTH_SHORT[date.getMonth()]} ${formatYear(year)}`;
    default:      return '';
  }
}

// ─── Color palettes ──────────────────────────────────────────────────────────
// Tableau 20 palette — perceptually distinct, readable on dark backgrounds
const TABLEAU_20 = [
  '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f',
  '#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac',
  '#d37295','#fabfd2','#b6992d','#499894','#86bcb6',
  '#e49444','#d4a6c8','#f1ce63','#a0cbe8','#ffbe7d',
];

export const CAT_PALETTE  = TABLEAU_20.slice(0, 10);
export const REG_PALETTE  = TABLEAU_20.slice(0, 14);

export function buildColorMap(ids: number[], palette: string[]): Map<number, string> {
  const map = new Map<number, string>();
  [...new Set(ids)].forEach((id, i) => map.set(id, palette[i % palette.length]));
  return map;
}

// ─── Item builder ────────────────────────────────────────────────────────────
export type ColorBy = 'category' | 'region';
export type GroupBy = 'none' | 'region' | 'category';

function getItemColor(
  event: TimelineEvent,
  colorBy: ColorBy,
  catMap: Map<number, string>,
  regMap: Map<number, string>,
): string {
  if (colorBy === 'category' && event.categories.length > 0)
    return catMap.get(event.categories[0].id) ?? '#5b7fff';
  if (colorBy === 'region' && event.regions.length > 0)
    return regMap.get(event.regions[0].id) ?? '#5b7fff';
  return '#5b7fff';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildTimelineData(
  events: TimelineEvent[],
  groupBy: GroupBy,
  colorBy: ColorBy,
  regions: Region[],
  categories: Category[],
  catColorMap: Map<number, string>,
  regColorMap: Map<number, string>,
): { items: object[]; groups: object[] } {
  const items: object[] = [];
  const groups: object[] = [];

  function makeItem(event: TimelineEvent, id: string, group?: number): object {
    const isRange = event.event_type === 'range' && event.end_year != null;
    const circa   = event.start_circa || event.end_circa;
    const color   = getItemColor(event, colorBy, catColorMap, regColorMap);
    return {
      id,
      content: `<span class="tl-label">${event.title}</span>`,
      start: yearToDate(event.start_year, event.start_month ?? 1, event.start_day ?? 1),
      ...(isRange
        ? { end: yearToDate(event.end_year!, event.end_month ?? 12, event.end_day ?? 28) }
        : {}),
      type: isRange ? 'range' : 'box',
      className: circa ? 'circa' : '',
      style: `background-color:${color};border-color:${color};`,
      ...(group != null ? { group } : {}),
    };
  }

  if (groupBy === 'none') {
    for (const e of events) items.push(makeItem(e, `e-${e.id}`));

  } else if (groupBy === 'region') {
    const seenIds = new Set<number>();
    let hasUnassigned = false;
    for (const e of events) {
      if (e.regions.length === 0) {
        hasUnassigned = true;
        items.push(makeItem(e, `e-${e.id}-r-0`, 0));
      } else {
        for (const r of e.regions) {
          seenIds.add(r.id);
          items.push(makeItem(e, `e-${e.id}-r-${r.id}`, r.id));
        }
      }
    }
    regions.filter(r => seenIds.has(r.id)).forEach(r =>
      groups.push({ id: r.id, content: r.name }),
    );
    if (hasUnassigned) groups.push({ id: 0, content: 'Unassigned' });

  } else { // category
    const seenIds = new Set<number>();
    let hasUnassigned = false;
    for (const e of events) {
      if (e.categories.length === 0) {
        hasUnassigned = true;
        items.push(makeItem(e, `e-${e.id}-c-0`, 0));
      } else {
        for (const c of e.categories) {
          seenIds.add(c.id);
          items.push(makeItem(e, `e-${e.id}-c-${c.id}`, c.id));
        }
      }
    }
    categories.filter(c => seenIds.has(c.id)).forEach(c =>
      groups.push({ id: c.id, content: c.name }),
    );
    if (hasUnassigned) groups.push({ id: 0, content: 'Unassigned' });
  }

  return { items, groups };
}
