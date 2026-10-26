import { useEffect, useState } from 'react';
import { num, str } from '@/lib/utils/record';
import { listFrom } from './format';

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
export type DayCode = (typeof WEEK_DAYS)[number];

export const DAY_SHORT: Record<DayCode, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
};

export const DAY_LONG: Record<DayCode, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
};

export type TimetableSlot = {
  key: string;
  day: DayCode;
  startTime: string;
  endTime: string;
  periodLabel: string;
  subjectId: number | null;
  subjectName: string;
  teacherName: string;
  roomName: string;
  order: number;
};

/** Normalise "08:30", "08:30:00" or "8:30" to "08:30"; empty when unparseable. */
export function normaliseTime(value: unknown): string {
  const text = str(value).trim();
  const match = /^(\d{1,2}):(\d{2})/.exec(text);
  if (!match) return '';
  return `${match[1]!.padStart(2, '0')}:${match[2]}`;
}

export function minutesOf(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function dayFrom(value: unknown): DayCode | null {
  if (typeof value === 'number') {
    // ISO weekday: 1 = Monday … 5 = Friday
    return WEEK_DAYS[value - 1] ?? null;
  }
  const text = str(value).trim().toLowerCase();
  if (!text) return null;
  const prefix = text.slice(0, 3);
  return (WEEK_DAYS as readonly string[]).includes(prefix) ? (prefix as DayCode) : null;
}

/** Parse API payload (array or `{ slots: [] }`) into normalised, sorted slots. */
export function parseTimetable(data: unknown): TimetableSlot[] {
  const rows = listFrom(data, 'slots', 'items', 'entries');
  const slots: TimetableSlot[] = [];
  rows.forEach((row, index) => {
    const day = dayFrom(row.weekdayName) ?? dayFrom(row.weekday) ?? dayFrom(row.dayOfWeek);
    if (!day) return;
    const startTime = normaliseTime(row.startTime);
    const endTime = normaliseTime(row.endTime);
    const order = num(row.timeSlotOrdinal ?? row.ordinal ?? row.period, index);
    const idValue = row.id;
    slots.push({
      key: typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : `${day}-${index}`,
      day,
      startTime,
      endTime,
      periodLabel: str(row.periodLabel) || (order > 0 ? `Period ${order}` : ''),
      subjectId: typeof row.subjectId === 'number' && row.subjectId > 0 ? row.subjectId : null,
      subjectName: str(row.subjectName) || 'Subject',
      teacherName: str(row.teacherName),
      roomName: str(row.roomName),
      order,
    });
  });
  return slots.sort((a, b) => {
    const am = minutesOf(a.startTime) ?? Number.MAX_SAFE_INTEGER;
    const bm = minutesOf(b.startTime) ?? Number.MAX_SAFE_INTEGER;
    return am - bm || a.order - b.order;
  });
}

/** Weekday code for a date, or null on Saturday/Sunday. */
export function dayCodeOf(date: Date): DayCode | null {
  return WEEK_DAYS[date.getDay() - 1] ?? null;
}

export function nowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function isCurrentSlot(slot: TimetableSlot, now: Date): boolean {
  if (dayCodeOf(now) !== slot.day) return false;
  const start = minutesOf(slot.startTime);
  const end = minutesOf(slot.endTime);
  if (start === null || end === null) return false;
  const current = nowMinutes(now);
  return current >= start && current < end;
}

export function isUpcomingSlot(slot: TimetableSlot, now: Date): boolean {
  if (dayCodeOf(now) !== slot.day) return false;
  const start = minutesOf(slot.startTime);
  return start !== null && start > nowMinutes(now);
}

export function timeRange(slot: Pick<TimetableSlot, 'startTime' | 'endTime'>): string {
  if (slot.startTime && slot.endTime) return `${slot.startTime} – ${slot.endTime}`;
  return slot.startTime || slot.endTime || '—';
}

/** Re-renders on an interval so "current period" stays accurate. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}