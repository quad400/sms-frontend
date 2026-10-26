import { proxyGet, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type AllocationRow = {
  id?: number;
  classId: number;
  subjectId: number;
  staffId: number;
  sessionId?: number;
  className?: string;
  subjectName?: string;
  staffName?: string;
};

export type TimeSlot = {
  id: number;
  name: string;
  ordinal: number;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
};

export type Room = { id: number; campusId: number; name: string; capacity?: number | null };

export type Timetable = {
  id: number;
  classId: number;
  sessionId?: number;
  termId: number;
  status: string;
  publishedAt?: string | null;
  slots?: TimetableSlot[];
};

export type TimetableSlot = {
  id?: number;
  weekday: string;
  timeSlotId: number;
  subjectId: number;
  teacherStaffId: number;
  roomId?: number | null;
};

export type LessonPlan = {
  id: number;
  title: string;
  status: string;
  classId: number;
  subjectId: number;
  termId: number;
  staffId?: number;
  weekNumber?: number | null;
  content?: string;
  objectives?: string | null;
  className?: string;
  subjectName?: string;
  staffName?: string;
};

async function asList<T>(res: Paginated<T> | T[]): Promise<T[]> {
  return Array.isArray(res) ? res : (res.data ?? []);
}

export function listAllocations(params: {
  classId?: string;
  sessionId?: string;
  subjectId?: string;
  page?: number;
}): Promise<Paginated<AllocationRow>> {
  return proxyGet('/api/v1/allocations', {
    classId: params.classId,
    sessionId: params.sessionId,
    subjectId: params.subjectId,
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function putStaffAllocations(
  staffId: number,
  body: { sessionId: number; allocations: Array<{ classId: number; subjectId: number }> },
) {
  return proxyPut(`/api/v1/staff/${staffId}/allocations`, body);
}

export async function listTimeSlots(): Promise<TimeSlot[]> {
  return asList(await proxyGet<Paginated<TimeSlot> | TimeSlot[]>('/api/v1/time-slots'));
}

export function putTimeSlots(timeSlots: Array<Record<string, unknown>>) {
  return proxyPut('/api/v1/time-slots', { timeSlots });
}

export async function listRooms(campusId?: string): Promise<Room[]> {
  return asList(
    await proxyGet<Paginated<Room> | Room[]>('/api/v1/rooms', {
      campusId,
      page: '1',
      pageSize: String(PAGE_SIZE),
    }),
  );
}

export function listTimetables(params: {
  classId?: string;
  termId?: string;
  status?: string;
  page?: number;
}): Promise<Paginated<Timetable>> {
  return proxyGet('/api/v1/timetables', {
    classId: params.classId,
    termId: params.termId,
    status: params.status,
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function getTimetable(id: number) {
  return proxyGet<Timetable>(`/api/v1/timetables/${id}`);
}

export function createTimetable(body: { classId: number; termId: number }) {
  return proxyPost<Timetable>('/api/v1/timetables', body);
}

export function putTimetableSlots(id: number, slots: TimetableSlot[]) {
  return proxyPut(`/api/v1/timetables/${id}/slots`, { slots });
}

export function publishTimetable(id: number) {
  return proxyPost(`/api/v1/timetables/${id}/publish`, {});
}

export function listLessonPlans(params: {
  status?: string;
  page?: number;
  classId?: string;
}): Promise<Paginated<LessonPlan>> {
  return proxyGet('/api/v1/lesson-plans', {
    status: params.status,
    classId: params.classId,
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function getLessonPlan(id: number) {
  return proxyGet<LessonPlan>(`/api/v1/lesson-plans/${id}`);
}

export function approveLessonPlan(id: number) {
  return proxyPost(`/api/v1/lesson-plans/${id}/approve`, {});
}
