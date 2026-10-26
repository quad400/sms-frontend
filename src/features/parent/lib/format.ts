import type { ParentChild } from '../types';

export function childName(child: Pick<ParentChild, 'firstName' | 'middleName' | 'lastName'>): string {
  return [child.firstName, child.middleName, child.lastName].filter(Boolean).join(' ');
}

export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  if (!value) return '';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', options);
}

export function formatLongDate(value: string | null | undefined): string {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
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
