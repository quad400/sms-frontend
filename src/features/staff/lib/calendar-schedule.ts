import {
  parseDate,
  statusLabel,
  toDateOnly,
  WEEKDAYS,
  type Weekday,
} from './format';
import type { CalendarEvent, LeaveRequest, Term, TimeSlot } from '../types';

export type ScheduleKind = 'class' | 'holiday' | 'leave' | 'activity';

/** Minimal teacher slot shape needed to place classes on the month grid. */
export type CalendarTeacherSlot = {
  id: number;
  weekday: string;
  timeSlotId: number;
  ordinal: number;
  classId: number;
  subjectId: number;
  roomId: number | null;
  termId: number;
};

export type ScheduleItem = {
  id: string;
  kind: ScheduleKind;
  date: string;
  title: string;
  detail?: string;
  timeLabel?: string;
  href?: string;
  status?: string;
  /** Overrides the default kind label in the chip (e.g. Exam, Meeting). */
  kindLabel?: string;
};

export type MonthCursor = { year: number; month: number };

const KIND_ORDER: Record<ScheduleKind, number> = {
  holiday: 0,
  leave: 1,
  activity: 2,
  class: 3,
};

const ACTIVE_LEAVE = new Set(['pending', 'approved']);

/** Inclusive list of `YYYY-MM-DD` from start through end. */
export function eachDateInRange(start: string, end: string): string[] {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b || a > b) return [];
  const out: string[] = [];
  const cursor = new Date(a);
  while (cursor <= b) {
    out.push(toDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function monthBounds(year: number, month: number): { from: string; to: string; days: number } {
  const days = new Date(year, month + 1, 0).getDate();
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(days).padStart(2, '0')}`;
  return { from, to, days };
}

export function weekdayOf(dateOnly: string): Weekday {
  const date = parseDate(dateOnly)!;
  return WEEKDAYS[(date.getDay() + 6) % 7]!;
}

function formatTimeRange(start: string, end: string): string {
  const a = /^(\d{1,2}):(\d{2})/.exec(start);
  const b = /^(\d{1,2}):(\d{2})/.exec(end);
  if (!a || !b) return '';
  const left = `${a[1]!.padStart(2, '0')}:${a[2]}`;
  const right = `${b[1]!.padStart(2, '0')}:${b[2]}`;
  return `${left} – ${right}`;
}

function dayOfEvent(value: string): string {
  const date = parseDate(value);
  return date ? toDateOnly(date) : value.slice(0, 10);
}

function eventDays(event: CalendarEvent, from: string, to: string): string[] {
  const start = dayOfEvent(event.startsAt);
  const end = event.endsAt ? dayOfEvent(event.endsAt) : start;
  return eachDateInRange(start < from ? from : start, end > to ? to : end);
}

function eventTimeLabel(event: CalendarEvent): string {
  const timed = /T\d{2}:\d{2}/.test(event.startsAt);
  if (!timed) return 'All day';
  const start = parseDate(event.startsAt);
  if (!start) return 'All day';
  const startText = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (!event.endsAt) return startText;
  const end = parseDate(event.endsAt);
  if (!end || toDateOnly(end) !== toDateOnly(start)) return startText;
  const endText = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${startText} – ${endText}`;
}

function eventKind(eventType: string): ScheduleKind | null {
  if (eventType === 'holiday') return 'holiday';
  if (eventType === 'activity' || eventType === 'exam' || eventType === 'meeting' || eventType === 'other') {
    return 'activity';
  }
  return null;
}

function push(map: Map<string, ScheduleItem[]>, item: ScheduleItem): void {
  const list = map.get(item.date);
  if (list) list.push(item);
  else map.set(item.date, [item]);
}

function sortDay(items: ScheduleItem[]): ScheduleItem[] {
  return items.sort((a, b) => {
    const kind = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    if (kind !== 0) return kind;
    const timeA = a.timeLabel ?? '';
    const timeB = b.timeLabel ?? '';
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return a.title.localeCompare(b.title);
  });
}

export function buildMonthSchedule(input: {
  from: string;
  to: string;
  events: CalendarEvent[];
  leave: LeaveRequest[];
  terms: Term[];
  slots: CalendarTeacherSlot[];
  timeSlots: TimeSlot[];
  className: (id: number) => string;
  subjectName: (id: number) => string;
  roomName: (id: number | null) => string;
}): Map<string, ScheduleItem[]> {
  const map = new Map<string, ScheduleItem[]>();
  const { from, to } = input;
  const slotById = new Map(input.timeSlots.map((slot) => [slot.id, slot]));
  const termById = new Map(input.terms.map((term) => [term.id, term]));

  for (const term of input.terms) {
    for (const holiday of term.holidays ?? []) {
      if (holiday.date < from || holiday.date > to) continue;
      push(map, {
        id: `term-holiday-${holiday.id}`,
        kind: 'holiday',
        date: holiday.date,
        title: holiday.name,
        timeLabel: 'All day',
        detail: 'School holiday',
      });
    }
  }

  for (const event of input.events) {
    const kind = eventKind(event.eventType);
    if (!kind) continue;
    for (const date of eventDays(event, from, to)) {
      push(map, {
        id: `event-${event.id}-${date}`,
        kind,
        date,
        title: event.title,
        detail: [event.location, event.description].filter(Boolean).join(' · ') || undefined,
        timeLabel: eventTimeLabel(event),
        kindLabel: kind === 'activity' ? statusLabel(event.eventType) : undefined,
      });
    }
  }

  for (const request of input.leave) {
    if (!ACTIVE_LEAVE.has(request.status)) continue;
    const start = request.startDate < from ? from : request.startDate;
    const end = request.endDate > to ? to : request.endDate;
    for (const date of eachDateInRange(start, end)) {
      push(map, {
        id: `leave-${request.id}-${date}`,
        kind: 'leave',
        date,
        title: request.leaveTypeName,
        detail: request.reason ?? undefined,
        timeLabel: 'All day',
        status: request.status,
        href: '/staff/leave',
      });
    }
  }

  for (const date of eachDateInRange(from, to)) {
    const weekday = weekdayOf(date);
    for (const slot of input.slots) {
      if (slot.weekday !== weekday) continue;
      const term = termById.get(slot.termId);
      if (term && (date < term.startDate || date > term.endDate)) continue;
      const period = slotById.get(slot.timeSlotId);
      const subject = input.subjectName(slot.subjectId);
      const classLabel = input.className(slot.classId);
      const room = input.roomName(slot.roomId);
      push(map, {
        id: `class-${slot.id}-${date}`,
        kind: 'class',
        date,
        title: subject,
        detail: [classLabel, room].filter(Boolean).join(' · ') || undefined,
        timeLabel: period
          ? formatTimeRange(period.startTime, period.endTime) || period.name
          : `Period ${slot.ordinal}`,
        href: '/staff/timetable',
      });
    }
  }

  for (const [date, items] of map) {
    map.set(date, sortDay(items));
  }
  return map;
}

export const SCHEDULE_KIND_META: Record<
  ScheduleKind,
  { label: string; dot: string; chip: string }
> = {
  class: {
    label: 'Class',
    dot: 'bg-primary',
    chip: 'bg-muted text-foreground',
  },
  holiday: {
    label: 'Holiday',
    dot: 'bg-amber-600',
    chip: 'bg-amber-500/15 text-amber-900',
  },
  leave: {
    label: 'Leave',
    dot: 'bg-rose-600',
    chip: 'bg-rose-500/15 text-rose-900',
  },
  activity: {
    label: 'Activity',
    dot: 'bg-emerald-600',
    chip: 'bg-emerald-500/15 text-emerald-900',
  },
};
