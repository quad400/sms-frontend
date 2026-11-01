import {
  formatDisplayDate,
  formatDisplayDateTime,
  parseAppDate,
} from '@/lib/format/date';
import type { ParentChild } from '../types';

export function childName(child: Pick<ParentChild, 'firstName' | 'middleName' | 'lastName'>): string {
  return [child.firstName, child.middleName, child.lastName].filter(Boolean).join(' ');
}

/** Platform default: `3rd Jan, 2026`. Custom Intl options kept for compact calendar cells. */
export function formatDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (options) {
    const date = parseAppDate(value);
    return date ? date.toLocaleDateString('en-GB', options) : '';
  }
  return formatDisplayDate(value);
}

export function formatLongDate(value: string | null | undefined): string {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDisplayDateTime(value);
}

export function formatTime(value: string | null | undefined): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
  return match ? `${match[1]!.padStart(2, '0')}:${match[2]}` : '';
}

export function statusLabel(code: string): string {
  const text = code.replace(/[-_]/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export function toDateOnly(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localToday(): string {
  return toDateOnly(new Date());
}

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
