'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  fetchAttendanceSummaries,
  fetchStaffAttendanceSummaries,
  fetchStudentAttendanceSummaries,
  getRegister,
  getStaffAttendance,
  listRegisters,
  putRegisterEntries,
  putStaffAttendance,
  reopenRegister,
  type AttendanceRegister,
  type AttendanceSummary,
  type StaffAttendanceRow,
  type StaffAttendanceSummary,
  type StudentAttendanceSummary,
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
  enabled?: boolean;
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
    enabled: params.enabled !== false,
  });
}

export function useStudentAttendanceSummaries(params: {
  from: string;
  to: string;
  classId?: string;
  campusId?: string;
  page: number;
  enabled?: boolean;
}) {
  return useQuery<Paginated<StudentAttendanceSummary>, ApiClientError>({
    queryKey: adminKeys.studentAttendanceSummaries({
      from: params.from,
      to: params.to,
      classId: params.classId,
      campusId: params.campusId,
      page: params.page,
    }),
    queryFn: () =>
      fetchStudentAttendanceSummaries({
        from: params.from,
        to: params.to,
        classId: params.classId || undefined,
        campusId: params.campusId,
        page: params.page,
      }),
    enabled: params.enabled !== false,
  });
}

export function useStaffAttendanceSummaries(params: {
  from: string;
  to: string;
  campusId?: string;
  enabled?: boolean;
}) {
  return useQuery<
    { from: string; to: string; staff: StaffAttendanceSummary[] },
    ApiClientError
  >({
    queryKey: adminKeys.staffAttendanceSummaries({
      from: params.from,
      to: params.to,
      campusId: params.campusId,
    }),
    queryFn: () =>
      fetchStaffAttendanceSummaries({
        from: params.from,
        to: params.to,
        campusId: params.campusId,
      }),
    enabled: params.enabled !== false,
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
  return useQuery<StaffAttendanceRow[], ApiClientError>({
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
