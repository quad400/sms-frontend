'use client';

import { useMemo } from 'react';
import {
  buildMonthSchedule,
  monthBounds,
  type MonthCursor,
  type ScheduleItem,
} from '../lib/calendar-schedule';
import { useEvents } from './use-communication';
import { useLeaveRequests } from './use-leave';
import { useStaffLookups } from './use-staff-lookups';
import { useStaffMe } from './use-staff-me';
import { useStaffTimetable } from './use-staff-timetable';

export function useStaffCalendar(cursor: MonthCursor) {
  const me = useStaffMe();
  const staffId = me.data?.staffId;
  const events = useEvents();
  const leave = useLeaveRequests({ staffId }, staffId !== undefined);
  const timetable = useStaffTimetable();
  const lookups = useStaffLookups();

  const { from, to, days } = useMemo(
    () => monthBounds(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const byDate = useMemo(() => {
    return buildMonthSchedule({
      from,
      to,
      events: events.data ?? [],
      leave: leave.data?.data ?? [],
      terms: lookups.terms,
      slots: timetable.slots,
      timeSlots: timetable.timeSlots,
      className: lookups.className,
      subjectName: lookups.subjectName,
      roomName: lookups.roomName,
    });
  }, [
    from,
    to,
    events.data,
    leave.data,
    lookups.terms,
    lookups.className,
    lookups.subjectName,
    lookups.roomName,
    timetable.slots,
    timetable.timeSlots,
  ]);

  const isPending =
    me.isPending ||
    events.isPending ||
    (staffId !== undefined && leave.isPending) ||
    timetable.isPending;

  const error = me.error ?? events.error ?? leave.error ?? timetable.error;

  return {
    from,
    to,
    days,
    byDate,
    isPending,
    error,
    refetch: () => {
      void me.refetch();
      void events.refetch();
      void leave.refetch();
      timetable.refetch();
    },
    itemsFor: (date: string): ScheduleItem[] => byDate.get(date) ?? [],
  };
}
