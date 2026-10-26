import { asRecord, str } from '@/lib/utils/record';

export const WITHHELD_COPY = 'Your results are not available yet. Please see the school office.';

/** Filter an unknown list down to plain records. */
export function toRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  const out: Record<string, unknown>[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (record) out.push(record);
  }
  return out;
}

/** Accepts `[...]` or `{ [key]: [...] }` payloads. */
export function listFrom(value: unknown, ...keys: string[]): Record<string, unknown>[] {
  if (Array.isArray(value)) return toRecords(value);
  const root = asRecord(value);
  if (!root) return [];
  for (const key of keys) {
    if (Array.isArray(root[key])) return toRecords(root[key]);
  }
  return [];
}

export function isWithheldRow(row: Record<string, unknown>): boolean {
  return row.withheld === true || str(row.status).toLowerCase() === 'withheld';
}

/** Render a numeric-ish score (number or string) for display. */
export function scoreText(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  return '—';
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const date = parseDate(str(value));
  return date ? date.toLocaleDateString('en-GB', options) : '';
}

export function formatDateTime(value: unknown): string {
  const date = parseDate(str(value));
  if (!date) return '';
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString(
    'en-GB',
    { hour: '2-digit', minute: '2-digit' },
  )}`;
}

export function firstName(value: string): string {
  return value.trim().split(/\s+/)[0] ?? '';
}
