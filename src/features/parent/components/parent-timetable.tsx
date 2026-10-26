'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useChildTimetable } from '../hooks/use-child-data';
import {
  childName,
  formatTime,
  WEEKDAY_LABEL,
  WEEKDAYS,
  type Weekday,
} from '../lib/format';
import { QueryState } from '../lib/shared';
import type { ParentChild, TimetableSlot } from '../types';

function weekdayOfToday(): Weekday {
  return WEEKDAYS[(new Date().getDay() + 6) % 7]!;
}

export function ParentTimetable({
  studentId,
  child,
}: {
  studentId: number;
  child: ParentChild | null;
}) {
  const timetable = useChildTimetable(studentId);
  const slots = timetable.data ?? [];
  const days = useMemo(() => {
    const used = new Set(slots.map((slot) => slot.weekday.toLowerCase()));
    return WEEKDAYS.filter((day, index) => index < 5 || used.has(day));
  }, [slots]);
  const today = weekdayOfToday();
  const defaultDay = (days.find((day) => day === today) ?? days[0] ?? 'monday') as Weekday;
  const [dayChoice, setDayChoice] = useState<Weekday | null>(null);
  const day = dayChoice && days.includes(dayChoice) ? dayChoice : defaultDay;

  const daySlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.weekday.toLowerCase() === day)
        .sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0) || (a.startTime ?? '').localeCompare(b.startTime ?? '')),
    [slots, day],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Timetable"
        description={child ? `Weekly schedule for ${childName(child)}.` : 'Weekly class schedule.'}
      />

      <QueryState
        isPending={timetable.isPending}
        error={timetable.error}
        onRetry={() => void timetable.refetch()}
        isEmpty={slots.length === 0}
        empty={
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No published timetable for this child yet.
          </p>
        }
      >
        <div className="overflow-x-auto">
          <SegmentedControl
            aria-label="Day of week"
            value={day}
            onValueChange={setDayChoice}
            options={days.map((value) => ({
              value,
              label: WEEKDAY_LABEL[value].slice(0, 3),
            }))}
          />
        </div>
        <DayList slots={daySlots} />
      </QueryState>
    </div>
  );
}

function DayList({ slots }: { slots: TimetableSlot[] }) {
  if (slots.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No lessons on this day.
      </p>
    );
  }
  return (
    <ul className="grid gap-2">
      {slots.map((slot, index) => (
        <li
          key={slot.id ?? `${slot.weekday}-${slot.startTime}-${index}`}
          className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {slot.periodName ?? 'Period'}
            {slot.startTime
              ? ` · ${formatTime(slot.startTime)}${slot.endTime ? ` – ${formatTime(slot.endTime)}` : ''}`
              : ''}
          </p>
          <p className="mt-1 font-medium">{slot.subjectName ?? 'Subject'}</p>
          <p className="text-sm text-muted-foreground">
            {[slot.teacherName, slot.roomName].filter(Boolean).join(' · ') || '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
