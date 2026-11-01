import { format, isValid, parse } from 'date-fns';

const ISO_DATE = 'yyyy-MM-dd';
/** Platform display: 3rd Jan, 2026 */
const DISPLAY_DATE = "do MMM, yyyy";

/**
 * Parse app dates without UTC day-shift for `yyyy-MM-dd` values.
 * Also accepts full ISO timestamps.
 */
export function parseAppDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  if (!raw) return null;

  const dateOnly = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) && (raw.length === 10 || raw[10] === 'T')) {
    const parsed = parse(dateOnly, ISO_DATE, new Date());
    return isValid(parsed) ? parsed : null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** User-facing date: `3rd Jan, 2026`. Empty/invalid → `''`. */
export function formatDisplayDate(value: unknown): string {
  const date = parseAppDate(value);
  return date ? format(date, DISPLAY_DATE) : '';
}

/**
 * User-facing date for fact rows / tables where empty should show an em dash.
 */
export function formatDisplayDateOrDash(value: unknown): string {
  return formatDisplayDate(value) || '—';
}

/** Date in platform style + local time, e.g. `3rd Jan, 2026, 14:05`. */
export function formatDisplayDateTime(value: unknown): string {
  const date = parseAppDate(value);
  if (!date) return '';
  const day = format(date, DISPLAY_DATE);
  const time = format(date, 'HH:mm');
  return `${day}, ${time}`;
}
