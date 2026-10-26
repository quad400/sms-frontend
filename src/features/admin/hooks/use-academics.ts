'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  approveLessonPlan,
  createTimetable,
  getLessonPlan,
  getTimetable,
  listAllocations,
  listLessonPlans,
  listRooms,
  listTimeSlots,
  listTimetables,
  publishTimetable,
  putStaffAllocations,
  putTimeSlots,
  putTimetableSlots,
  type AllocationRow,
  type LessonPlan,
  type Room,
  type TimeSlot,
  type Timetable,
  type TimetableSlot,
} from '../api/academics';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

export type AllocationsParams = {
  classId?: string;
  sessionId?: string;
  subjectId?: string;
  page?: number;
};

export function useAllocations(params: AllocationsParams = {}, enabled = true) {
  return useQuery<Paginated<AllocationRow>, ApiClientError>({
    queryKey: adminKeys.allocations({ ...params }),
    queryFn: () => listAllocations(params),
    enabled,
  });
}

export type SaveAllocationsVars = {
  /** subjectId -> staffId (0 / falsy = unassigned) */
  map: Record<number, number>;
  classId: string;
  sessionId: string;
  /** Existing allocations used to preserve each teacher's other classes. */
  existing: AllocationRow[];
};

export function useSaveAllocations() {
  const qc = useQueryClient();
  return useMutation<void, ApiClientError, SaveAllocationsVars>({
    mutationFn: async ({ map, classId, sessionId, existing }) => {
      const byStaff = new Map<number, Array<{ classId: number; subjectId: number }>>();
      for (const [subjectId, staffId] of Object.entries(map)) {
        if (!staffId) continue;
        const sid = Number(staffId);
        const arr = byStaff.get(sid) ?? [];
        arr.push({ classId: Number(classId), subjectId: Number(subjectId) });
        byStaff.set(sid, arr);
      }
      // Merge with existing allocations for each teacher outside this class
      for (const [staffId, rows] of byStaff) {
        const others = existing.filter(
          (a) => a.staffId === staffId && a.classId !== Number(classId),
        );
        await putStaffAllocations(staffId, {
          sessionId: Number(sessionId),
          allocations: [
            ...others.map((a) => ({ classId: a.classId, subjectId: a.subjectId })),
            ...rows,
          ],
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.allocations({}) }),
  });
}

export function useTimeSlots() {
  return useQuery<TimeSlot[], ApiClientError>({
    queryKey: adminKeys.timeSlots(),
    queryFn: listTimeSlots,
  });
}

export function useSaveTimeSlots() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, Array<Record<string, unknown>>>({
    mutationFn: putTimeSlots,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.timeSlots() }),
  });
}

export function useRooms(campusId?: string) {
  return useQuery<Room[], ApiClientError>({
    queryKey: adminKeys.rooms(campusId),
    queryFn: () => listRooms(campusId),
  });
}

export function useTimetables(params: { page: number; classId?: string }) {
  return useQuery<Paginated<Timetable>, ApiClientError>({
    queryKey: adminKeys.timetables({ page: params.page, classId: params.classId ?? '' }),
    queryFn: () =>
      listTimetables({ page: params.page, classId: params.classId || undefined }),
  });
}

export function useTimetable(id: number) {
  return useQuery<Timetable, ApiClientError>({
    queryKey: adminKeys.timetable(id),
    queryFn: () => getTimetable(id),
  });
}

export function useCreateTimetable() {
  const qc = useQueryClient();
  return useMutation<Timetable, ApiClientError, { classId: number; termId: number }>({
    mutationFn: createTimetable,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.timetables({}) }),
  });
}

export function useSaveTimetableSlots(timetableId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, TimetableSlot[]>({
    mutationFn: (slots) => putTimetableSlots(timetableId, slots),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.timetable(timetableId) }),
  });
}

export function usePublishTimetable(timetableId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => publishTimetable(timetableId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.timetable(timetableId) }),
  });
}

export function useLessonPlans(params: { status?: string; page: number }) {
  return useQuery<Paginated<LessonPlan>, ApiClientError>({
    queryKey: adminKeys.lessonPlans({ status: params.status, page: params.page }),
    queryFn: () => listLessonPlans({ status: params.status || undefined, page: params.page }),
  });
}

export function useLessonPlan(id: number | null) {
  return useQuery<LessonPlan, ApiClientError>({
    queryKey: adminKeys.lessonPlan(id ?? 0),
    queryFn: () => getLessonPlan(id!),
    enabled: id != null,
  });
}

export function useApproveLessonPlan() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: approveLessonPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.lessonPlans({}) }),
  });
}
