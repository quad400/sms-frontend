'use client';

import { useMemo, useState } from 'react';
import { CalendarX2, Printer } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { useNow } from '../hooks/use-now';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useStaffTimetable } from '../hooks/use-staff-timetable';
import { minutesOf, nowInZone, WEEKDAYS, WEEKDAY_LABEL, type Weekday } from '../lib/format';
import { QueryState } from '../lib/shared';
import { EmptyPanel } from './shared/panel';
import { DayAgenda } from './timetable/day-agenda';
import type { PeriodRow, TimetableEntry } from './timetable/timetable-types';
import { WeekGrid } from './timetable/week-grid';

type View = 'week' | 'day';

const VIEWS = [
  { value: 'week' as const, label: 'Week' },
  { value: 'day' as const, label: 'Day' },
];

export function StaffTimetable() {
  const timetable = useStaffTimetable();
  const lookups = useStaffLookups();
  const now = useNow();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [viewChoice, setViewChoice] = useState<View | null>(null);
  const [dayChoice, setDayChoice] = useState<Weekday | null>(null);

  const clock = now ? nowInZone(undefined, now) : null;
  const clockWeekday = clock?.weekday;
  const clockMinutes = clock?.minutes;
  const view: View = viewChoice ?? (isDesktop ? 'week' : 'day');

  const { entries, periods, days } = useMemo(() => {
    const slotById = new Map(timetable.timeSlots.map((slot) => [slot.id, slot]));
    const built: TimetableEntry[] = timetable.slots.map((slot) => {
      const period = slotById.get(slot.timeSlotId);
      const start = period?.startTime ?? '';
      const end = period?.endTime ?? '';
      const startMin = minutesOf(start);
      const endMin = minutesOf(end);
      const current =
        clockMinutes !== undefined &&
        clockWeekday === slot.weekday &&
        startMin !== null &&
        endMin !== null &&
        clockMinutes >= startMin &&
        clockMinutes < endMin;
      return {
        id: slot.id,
        weekday: slot.weekday,
        ordinal: slot.ordinal,
        periodName: period?.name ?? `Period ${slot.ordinal}`,
        startTime: start,
        endTime: end,
        subject: lookups.subjectName(slot.subjectId),
        className: lookups.className(slot.classId),
        room: lookups.roomName(slot.roomId),
        current,
      };
    });

    const periodMap = new Map<number, PeriodRow>();
    for (const entry of built) {
      if (!periodMap.has(entry.ordinal)) {
        periodMap.set(entry.ordinal, {
          ordinal: entry.ordinal,
          name: entry.periodName,
          startTime: entry.startTime,
          endTime: entry.endTime,
        });
      }
    }
    const used = new Set(built.map((entry) => entry.weekday));
    const visibleDays = WEEKDAYS.filter(
      (day, index) => index < 5 || used.has(day),
    ) as Weekday[];

    return {
      entries: built,
      periods: [...periodMap.values()].sort((a, b) => a.ordinal - b.ordinal),
      days: visibleDays,
    };
  }, [timetable.slots, timetable.timeSlots, lookups, clockWeekday, clockMinutes]);

  const today = clockWeekday ?? '';
  const defaultDay = (days.find((day) => day === today) ??
    days.find((day) => entries.some((entry) => entry.weekday === day)) ??
    days[0]) as Weekday;
  const day = dayChoice ?? defaultDay;

  return (
    <div className="space-y-5">
      <PageHeader
        title="My timetable"
        description="Your teaching periods for the current term."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <SegmentedControl
              aria-label="Timetable view"
              value={view}
              onValueChange={setViewChoice}
              options={VIEWS}
            />
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer aria-hidden />
              Print
            </Button>
          </div>
        }
      />

      <QueryState
        isPending={timetable.isPending}
        error={timetable.error}
        onRetry={timetable.refetch}
        isEmpty={entries.length === 0}
        empty={
          <EmptyPanel
            icon={CalendarX2}
            title="No timetable yet"
            description="You have no teaching periods on a published timetable for the current term."
          />
        }
      >
        {view === 'week' ? (
          <WeekGrid days={days} periods={periods} entries={entries} today={today} />
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <SegmentedControl
                aria-label="Day of week"
                value={day}
                onValueChange={setDayChoice}
                options={days.map((value) => ({ value, label: WEEKDAY_LABEL[value].slice(0, 3) }))}
              />
            </div>
            <DayAgenda
              day={day}
              entries={entries.filter((entry) => entry.weekday === day).sort((a, b) => a.ordinal - b.ordinal)}
            />
          </div>
        )}
      </QueryState>
    </div>
  );
}
