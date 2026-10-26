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

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** `YYYY-MM-DD` for a Date in the browser's local zone. */
export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localToday(): string {
  return toDateOnly(new Date());
}

export function addDays(dateOnly: string, days: number): string {
  const date = parseDate(dateOnly) ?? new Date();
  date.setDate(date.getDate() + days);
  return toDateOnly(date);
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('en-GB', options) : '';
}

export function formatLongDate(value: string | null | undefined): string {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '';
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${time}`;
}

/** `08:30:00` / `8:30` → `08:30`. */
export function formatTime(value: string | null | undefined): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
  return match ? `${match[1]!.padStart(2, '0')}:${match[2]}` : '';
}

export function timeRange(start: string, end: string): string {
  const a = formatTime(start);
  const b = formatTime(end);
  return a && b ? `${a} – ${b}` : a || b;
}

export function minutesOf(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** Minutes since local midnight and lower-case weekday in an IANA timezone. */
export function nowInZone(timeZone: string | undefined, now: Date = new Date()): {
  minutes: number;
  weekday: string;
  date: string;
} {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    return {
      minutes: Number(pick('hour')) * 60 + Number(pick('minute')),
      weekday: pick('weekday').toLowerCase(),
      date: `${pick('year')}-${pick('month')}-${pick('day')}`,
    };
  } catch {
    return {
      minutes: now.getHours() * 60 + now.getMinutes(),
      weekday: WEEKDAYS[(now.getDay() + 6) % 7]!,
      date: toDateOnly(now),
    };
  }
}

export function greetingFor(minutes: number): string {
  if (minutes < 12 * 60) return 'Good morning';
  if (minutes < 17 * 60) return 'Good afternoon';
  return 'Good evening';
}

export function fullName(
  first: string | null | undefined,
  last: string | null | undefined,
  middle?: string | null,
): string {
  return [first, middle, last].filter(Boolean).join(' ');
}

/** `partially-paid` → `Partially paid`. */
export function statusLabel(code: string): string {
  const text = code.replace(/[-_]/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Inclusive number of calendar days between two `YYYY-MM-DD` dates. */
export function inclusiveDays(start: string, end: string): number {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
}
