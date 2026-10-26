'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchAttendanceSummaries,
  getRegister,
  getStaffAttendance,
  listRegisters,
  putRegisterEntries,
  putStaffAttendance,
  reopenRegister,
  type AttendanceRegister,
  type AttendanceSummary,
  type StaffAttendanceRow,
} from '../api/attendance';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

export function useRegisters(params: { date: string; campusId?: string; page: number }) {
  return useQuery<Paginated<AttendanceRegister>, ApiClientError>({
    queryKey: adminKeys.registers({
      date: params.date,
      campusId: params.campusId,
      page: params.page,
    }),
    queryFn: () =>
      listRegisters({ date: params.date, campusId: params.campusId, page: params.page }),
  });
}

export function useAttendanceSummaries(params: {
  from: string;
  to: string;
  classId?: string;
  campusId?: string;
}) {
  return useQuery<
    { from: string; to: string; classes: AttendanceSummary[] },
    ApiClientError
  >({
    queryKey: adminKeys.attendanceSummaries({
      from: params.from,
      to: params.to,
      classId: params.classId,
      campusId: params.campusId,
    }),
    queryFn: () =>
      fetchAttendanceSummaries({
        from: params.from,
        to: params.to,
        classId: params.classId || undefined,
        campusId: params.campusId,
      }),
  });
}

export function useRegister(id: number) {
  return useQuery<AttendanceRegister, ApiClientError>({
    queryKey: adminKeys.register(id),
    queryFn: () => getRegister(id),
  });
}

export function useSaveRegisterEntries(registerId: number) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    Array<{ clientRef: string; studentId: number; markCode: string; note?: string }>
  >({
    mutationFn: (entries) => putRegisterEntries(registerId, entries),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.register(registerId) }),
  });
}

export function useReopenRegister(registerId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (reason) => reopenRegister(registerId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.register(registerId) }),
  });
}

export function useStaffAttendance(date: string, campusId?: string) {
  return useQuery<{ date: string; records: StaffAttendanceRow[] }, ApiClientError>({
    queryKey: adminKeys.staffAttendance(date, campusId),
    queryFn: () => getStaffAttendance(date, campusId),
  });
}

export function useSaveStaffAttendance(date: string, campusId?: string) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    Array<{ staffId: number; markCode: string; note?: string }>
  >({
    mutationFn: (records) => putStaffAttendance(date, records),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: adminKeys.staffAttendance(date, campusId) }),
  });
}
