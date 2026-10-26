import { proxyGet, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import type {
  AttendanceEntry,
  AttendanceRegister,
  AttendanceSummary,
  MarkEntryInput,
  Paginated,
} from '../types';

export function fetchRegisters(params: {
  classId?: number;
  date?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<AttendanceRegister>> {
  return proxyGet<Paginated<AttendanceRegister>>('/api/v1/attendance/registers', {
    classId: params.classId === undefined ? undefined : String(params.classId),
    date: params.date,
    status: params.status,
    page: params.page === undefined ? undefined : String(params.page),
    pageSize: params.pageSize === undefined ? undefined : String(params.pageSize),
  });
}

export function fetchRegister(id: number): Promise<AttendanceRegister> {
  return proxyGet<AttendanceRegister>(`/api/v1/attendance/registers/${id}`);
}

export function openRegister(body: {
  classId: number;
  date: string;
  clientRef: string;
}): Promise<AttendanceRegister> {
  return proxyPost<AttendanceRegister>('/api/v1/attendance/registers', body);
}

export function markEntriesPath(registerId: number): string {
  return `/api/v1/attendance/registers/${registerId}/entries`;
}

export function putEntries(
  registerId: number,
  entries: MarkEntryInput[],
): Promise<{ registerId: number; absencesRecorded: number; entries: AttendanceEntry[] }> {
  return proxyPut(markEntriesPath(registerId), { entries });
}

export function submitRegister(id: number): Promise<AttendanceRegister> {
  return proxyPost<AttendanceRegister>(`/api/v1/attendance/registers/${id}/submit`, {});
}

export function fetchAttendanceSummaries(params: {
  classId: number;
  from: string;
  to: string;
}): Promise<{ from: string; to: string; classes: AttendanceSummary[] }> {
  return proxyGet('/api/v1/attendance/summaries', {
    classId: String(params.classId),
    from: params.from,
    to: params.to,
  });
}
