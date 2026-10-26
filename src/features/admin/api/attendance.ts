import { proxyGet, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type AttendanceRegister = {
  id: number;
  classId: number;
  campusId?: number;
  date: string;
  status: string;
  period?: string;
  submittedAt?: string | null;
  className?: string;
  entries?: AttendanceEntry[];
  counts?: Record<string, number>;
};

export type AttendanceEntry = {
  id: number | string;
  studentId: number;
  mark?: string;
  markCode?: string;
  note?: string | null;
  studentName?: string;
};

export type AttendanceSummary = {
  classId: number;
  registers?: number;
  submittedRegisters?: number;
  counts?: Record<string, number>;
  total?: number;
  attendanceRate?: number | null;
  className?: string;
};

export type StaffAttendanceRow = {
  staffId: number;
  staffName?: string;
  markCode?: string | null;
  note?: string | null;
};

export function listRegisters(params: {
  date?: string;
  campusId?: string;
  classId?: string;
  status?: string;
  page?: number;
}): Promise<Paginated<AttendanceRegister>> {
  return proxyGet('/api/v1/attendance/registers', {
    date: params.date,
    campusId: params.campusId,
    classId: params.classId,
    status: params.status,
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function getRegister(id: number) {
  return proxyGet<AttendanceRegister>(`/api/v1/attendance/registers/${id}`);
}

export function putRegisterEntries(
  id: number,
  entries: Array<{ clientRef: string; studentId: number; markCode: string; note?: string }>,
) {
  return proxyPut(`/api/v1/attendance/registers/${id}/entries`, { entries });
}

export function reopenRegister(id: number, reason: string) {
  return proxyPost(`/api/v1/attendance/registers/${id}/reopen`, { reason });
}

export function fetchAttendanceSummaries(params: {
  from: string;
  to: string;
  classId?: string;
  campusId?: string;
}) {
  return proxyGet<{ from: string; to: string; classes: AttendanceSummary[] }>(
    '/api/v1/attendance/summaries',
    {
      from: params.from,
      to: params.to,
      classId: params.classId,
      campusId: params.campusId,
    },
  );
}

export function getStaffAttendance(date: string, campusId?: string) {
  return proxyGet<{ date: string; records: StaffAttendanceRow[] }>('/api/v1/staff-attendance', {
    date,
    campusId,
  });
}

export function putStaffAttendance(
  date: string,
  records: Array<{ staffId: number; markCode: string; note?: string }>,
) {
  return proxyPut('/api/v1/staff-attendance', { date, records });
}
