'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchClassRoster,
  fetchClasses,
  fetchClassStudentCount,
  fetchRooms,
  fetchSubjects,
  fetchTerms,
  fetchTimeSlots,
} from '../api/structure';
import { staffKeys } from '../api/keys';
import type { Paginated, Room, SchoolClass, StudentSummary, Subject, Term, TimeSlot } from '../types';

const REFERENCE_STALE = 10 * 60_000;

/**
 * Reference lists are display-only helpers: a teacher may lack the permission to list them,
 * so failures are not retried and callers fall back to ids.
 */
export function useClasses() {
  return useQuery<SchoolClass[], ApiClientError>({
    queryKey: staffKeys.classes(),
    queryFn: fetchClasses,
    staleTime: REFERENCE_STALE,
    retry: false,
  });
}

export function useSubjects() {
  return useQuery<Subject[], ApiClientError>({
    queryKey: staffKeys.subjects(),
    queryFn: fetchSubjects,
    staleTime: REFERENCE_STALE,
    retry: false,
  });
}

export function useTerms() {
  return useQuery<Term[], ApiClientError>({
    queryKey: staffKeys.terms(),
    queryFn: fetchTerms,
    staleTime: REFERENCE_STALE,
    retry: false,
  });
}

export function useTimeSlots() {
  return useQuery<TimeSlot[], ApiClientError>({
    queryKey: staffKeys.timeSlots(),
    queryFn: fetchTimeSlots,
    staleTime: REFERENCE_STALE,
    retry: false,
  });
}

export function useRooms() {
  return useQuery<Paginated<Room>, ApiClientError>({
    queryKey: staffKeys.rooms(),
    queryFn: fetchRooms,
    staleTime: REFERENCE_STALE,
    retry: false,
  });
}

export function useClassRoster(classId: number | undefined) {
  return useQuery<StudentSummary[], ApiClientError>({
    queryKey: staffKeys.students(classId ?? 0),
    queryFn: () => fetchClassRoster(classId as number),
    enabled: classId !== undefined,
    staleTime: 60_000,
  });
}

type CountsResult = Record<number, number | undefined>;

function combineCounts(results: Array<{ data?: { classId: number; total: number } }>): CountsResult {
  const out: CountsResult = {};
  for (const result of results) {
    if (result.data) out[result.data.classId] = result.data.total;
  }
  return out;
}

/** Active student counts per class (one cheap request per class). */
export function useClassStudentCounts(classIds: number[]): CountsResult {
  return useQueries({
    queries: classIds.map((classId) => ({
      queryKey: staffKeys.studentCount(classId),
      queryFn: async () => ({ classId, total: await fetchClassStudentCount(classId) }),
      staleTime: 60_000,
      retry: false,
    })),
    combine: combineCounts,
  });
}
