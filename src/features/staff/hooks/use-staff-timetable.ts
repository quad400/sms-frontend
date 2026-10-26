'use client';

import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { fetchTimetable, fetchTimetables } from '../api/timetables';
import { staffKeys } from '../api/keys';
import type { Paginated, Timetable } from '../types';
import { useStaffMe } from './use-staff-me';
import { useTerms, useTimeSlots } from './use-structure';

export type TeacherSlot = {
  id: number;
  weekday: string;
  timeSlotId: number;
  ordinal: number;
  classId: number;
  subjectId: number;
  roomId: number | null;
  termId: number;
};

type Combined = {
  timetables: Array<Timetable | undefined>;
  isPending: boolean;
  error: Error | null;
};

function combineTimetables(
  results: Array<{ data?: Timetable; isPending: boolean; error: Error | null }>,
): Combined {
  return {
    timetables: results.map((result) => result.data),
    isPending: results.some((result) => result.isPending),
    error: results.find((result) => result.error)?.error ?? null,
  };
}

/** The signed-in teacher's own slots from published timetables of the active term. */
export function useStaffTimetable() {
  const me = useStaffMe();
  const staffId = me.data?.staffId;
  const terms = useTerms();
  const timeSlots = useTimeSlots();

  const list = useQuery<Paginated<Timetable>, ApiClientError>({
    queryKey: staffKeys.timetables({ teacherId: staffId, status: 'published' }),
    queryFn: () => fetchTimetables({ teacherId: staffId as number, status: 'published' }),
    enabled: staffId !== undefined,
  });

  const chosen = useMemo(() => {
    const rows = list.data?.data ?? [];
    if (rows.length === 0) return [];
    const activeIds = new Set((terms.data ?? []).filter((t) => t.isActive).map((t) => t.id));
    const active = rows.filter((row) => activeIds.has(row.termId));
    if (active.length > 0) return active;
    const latestTerm = Math.max(...rows.map((row) => row.termId));
    return rows.filter((row) => row.termId === latestTerm);
  }, [list.data, terms.data]);

  const details = useQueries({
    queries: chosen.map((timetable) => ({
      queryKey: staffKeys.timetable(timetable.id),
      queryFn: () => fetchTimetable(timetable.id),
    })),
    combine: combineTimetables,
  });

  const slots = useMemo<TeacherSlot[]>(() => {
    if (staffId === undefined) return [];
    const out: TeacherSlot[] = [];
    for (const timetable of details.timetables) {
      for (const slot of timetable?.slots ?? []) {
        if (slot.teacherStaffId !== staffId) continue;
        out.push({
          id: slot.id,
          weekday: slot.weekday,
          timeSlotId: slot.timeSlotId,
          ordinal: slot.timeSlotOrdinal,
          classId: timetable!.classId,
          subjectId: slot.subjectId,
          roomId: slot.roomId,
          termId: timetable!.termId,
        });
      }
    }
    return out.sort((a, b) => a.ordinal - b.ordinal);
  }, [details.timetables, staffId]);

  const loadingDetails = chosen.length > 0 && details.isPending;
  const error = me.error ?? list.error ?? details.error;

  return {
    slots,
    timeSlots: timeSlots.data ?? [],
    staffId,
    isPending: me.isPending || (staffId !== undefined && list.isPending) || loadingDetails,
    error,
    refetch: () => {
      void me.refetch();
      void list.refetch();
    },
  };
}
