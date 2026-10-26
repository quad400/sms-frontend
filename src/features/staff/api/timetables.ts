import { proxyGet } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE, fetchAllPages } from '../lib/paginate';
import type { Paginated, Timetable } from '../types';

export async function fetchTimetables(params: {
  teacherId: number;
  status?: string;
}): Promise<Paginated<Timetable>> {
  const data = await fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<Timetable>>('/api/v1/timetables', {
      teacherId: String(params.teacherId),
      status: params.status,
      page: String(page),
      pageSize: String(pageSize),
    }),
  );
  return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
}

export function fetchTimetable(id: number): Promise<Timetable> {
  return proxyGet<Timetable>(`/api/v1/timetables/${id}`);
}
