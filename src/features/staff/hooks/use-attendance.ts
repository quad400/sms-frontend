'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchAttendanceSummaries,
  fetchRegister,
  fetchRegisters,
  markEntriesPath,
  openRegister,
  putEntries,
  submitRegister,
} from '../api/attendance';
import { staffKeys } from '../api/keys';
import { sendOrQueue, type WriteResult } from '../lib/queue';
import type {
  AttendanceEntry,
  AttendanceRegister,
  AttendanceSummary,
  MarkEntryInput,
  Paginated,
} from '../types';

type RegisterFilters = { classId?: number; date?: string; status?: string; pageSize?: number };

export function useRegisters(filters: RegisterFilters, enabled = true) {
  return useQuery<Paginated<AttendanceRegister>, ApiClientError>({
    queryKey: staffKeys.registers({ ...filters }),
    queryFn: () => fetchRegisters(filters),
    enabled,
  });
}

export function useRegister(id: number) {
  return useQuery<AttendanceRegister, ApiClientError>({
    queryKey: staffKeys.register(id),
    queryFn: () => fetchRegister(id),
  });
}

export function useOpenRegister() {
  const queryClient = useQueryClient();
  return useMutation<
    AttendanceRegister,
    ApiClientError,
    { classId: number; date: string; clientRef: string }
  >({
    mutationFn: openRegister,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'registers'] });
      void queryClient.invalidateQueries({ queryKey: staffKeys.overview() });
    },
  });
}

type MarkResult = { registerId: number; absencesRecorded: number; entries: AttendanceEntry[] };

/** Marks entries online, or queues the PUT in the offline outbox. */
export function useMarkEntries(registerId: number) {
  const queryClient = useQueryClient();
  return useMutation<WriteResult<MarkResult>, ApiClientError, MarkEntryInput[]>({
    mutationFn: (entries) =>
      sendOrQueue({
        method: 'PUT',
        path: markEntriesPath(registerId),
        body: { entries },
        send: () => putEntries(registerId, entries),
      }),
    onSuccess: (result) => {
      if (result.queued) return;
      // Merge the server's answer right away so rows never flash stale marks.
      queryClient.setQueryData<AttendanceRegister>(staffKeys.register(registerId), (previous) => {
        if (!previous) return previous;
        const byStudent = new Map((previous.entries ?? []).map((entry) => [entry.studentId, entry]));
        for (const entry of result.data.entries) byStudent.set(entry.studentId, entry);
        return { ...previous, entries: [...byStudent.values()] };
      });
      void queryClient.invalidateQueries({ queryKey: staffKeys.register(registerId) });
    },
  });
}

export function useSubmitRegister(registerId: number) {
  const queryClient = useQueryClient();
  return useMutation<AttendanceRegister, ApiClientError, void>({
    mutationFn: () => submitRegister(registerId),
    onSuccess: (data) => {
      queryClient.setQueryData<AttendanceRegister>(staffKeys.register(registerId), (previous) =>
        previous ? { ...previous, status: data.status, submittedAt: data.submittedAt } : previous,
      );
      void queryClient.invalidateQueries({ queryKey: staffKeys.register(registerId) });
      void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'registers'] });
      void queryClient.invalidateQueries({ queryKey: staffKeys.overview() });
    },
  });
}

export function useAttendanceSummary(classId: number, from: string, to: string, enabled = true) {
  return useQuery<AttendanceSummary | null, ApiClientError>({
    queryKey: staffKeys.attendanceSummary(classId, from, to),
    queryFn: async () => {
      const result = await fetchAttendanceSummaries({ classId, from, to });
      return result.classes.find((row) => row.classId === classId) ?? null;
    },
    enabled,
    retry: false,
  });
}
