import { proxyGet } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE, fetchAllPages } from '../lib/paginate';
import type {
  Paginated,
  Room,
  SchoolClass,
  StudentSummary,
  Subject,
  Term,
  TimeSlot,
} from '../types';

export function fetchClasses(): Promise<SchoolClass[]> {
  return proxyGet<SchoolClass[]>('/api/v1/classes');
}

export function fetchSubjects(): Promise<Subject[]> {
  return proxyGet<Subject[]>('/api/v1/subjects');
}

export function fetchTerms(): Promise<Term[]> {
  return proxyGet<Term[]>('/api/v1/terms');
}

export function fetchTimeSlots(): Promise<TimeSlot[]> {
  return proxyGet<TimeSlot[]>('/api/v1/time-slots');
}

export async function fetchRooms(): Promise<Paginated<Room>> {
  const data = await fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<Room>>('/api/v1/rooms', {
      page: String(page),
      pageSize: String(pageSize),
    }),
  );
  return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
}

/** One page of the class roster (backend max pageSize is 10). */
export function fetchStudentsPage(
  classId: number,
  page: number,
  pageSize = PAGE_SIZE,
): Promise<Paginated<StudentSummary>> {
  return proxyGet<Paginated<StudentSummary>>('/api/v1/students', {
    classId: String(classId),
    page: String(page),
    pageSize: String(Math.min(pageSize, PAGE_SIZE)),
  });
}

/** Whole active roster for a class, following pagination. */
export async function fetchClassRoster(classId: number): Promise<StudentSummary[]> {
  return fetchAllPages((page, pageSize) => fetchStudentsPage(classId, page, pageSize));
}

export async function fetchClassStudentCount(classId: number): Promise<number> {
  const result = await fetchStudentsPage(classId, 1, 1);
  return result.meta.total;
}
