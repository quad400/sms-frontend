import {
  formatDisplayDate,
  formatDisplayDateTime,
  parseAppDate,
} from '@/lib/format/date';
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

/** Platform default: `3rd Jan, 2026`. Custom Intl options kept for compact calendar cells. */
export function formatDate(
  value: unknown,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (options) {
    const date = parseAppDate(str(value));
    return date ? date.toLocaleDateString('en-GB', options) : '';
  }
  return formatDisplayDate(value);
}

export function formatDateTime(value: unknown): string {
  return formatDisplayDateTime(value);
}

export function firstName(value: string): string {
  return value.trim().split(/\s+/)[0] ?? '';
}
