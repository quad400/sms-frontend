import { proxyDelete, proxyGet, proxyPatch, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE, fetchAllPages } from '../lib/paginate';
import type {
  LessonNote,
  LessonNoteDraft,
  LessonNotePatch,
  LessonPlan,
  LessonPlanDraft,
  LessonPlanPatch,
  Paginated,
} from '../types';

type ListParams = {
  classId?: number;
  subjectId?: number;
  termId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
};

function query(params: ListParams): Record<string, string | undefined> {
  return {
    classId: params.classId === undefined ? undefined : String(params.classId),
    subjectId: params.subjectId === undefined ? undefined : String(params.subjectId),
    termId: params.termId === undefined ? undefined : String(params.termId),
    status: params.status,
    page: params.page === undefined ? undefined : String(params.page),
    pageSize: String(Math.min(params.pageSize ?? PAGE_SIZE, PAGE_SIZE)),
  };
}

export async function fetchLessonPlans(params: ListParams): Promise<Paginated<LessonPlan>> {
  const data = await fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<LessonPlan>>('/api/v1/lesson-plans', query({ ...params, page, pageSize })),
  );
  return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
}

export function createLessonPlan(body: LessonPlanDraft): Promise<LessonPlan> {
  return proxyPost<LessonPlan>('/api/v1/lesson-plans', body);
}

export function updateLessonPlan(id: number, body: LessonPlanPatch): Promise<LessonPlan> {
  return proxyPatch<LessonPlan>(`/api/v1/lesson-plans/${id}`, body);
}

export function submitLessonPlan(id: number): Promise<LessonPlan> {
  return proxyPost<LessonPlan>(`/api/v1/lesson-plans/${id}/submit`, {});
}

export function approveLessonPlan(id: number): Promise<LessonPlan> {
  return proxyPost<LessonPlan>(`/api/v1/lesson-plans/${id}/approve`, {});
}

export async function fetchLessonNotes(params: ListParams): Promise<Paginated<LessonNote>> {
  const data = await fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<LessonNote>>('/api/v1/lesson-notes', query({ ...params, page, pageSize })),
  );
  return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
}

export function createLessonNote(body: LessonNoteDraft): Promise<LessonNote> {
  return proxyPost<LessonNote>('/api/v1/lesson-notes', body);
}

export function updateLessonNote(id: number, body: LessonNotePatch): Promise<LessonNote> {
  return proxyPatch<LessonNote>(`/api/v1/lesson-notes/${id}`, body);
}

export function deleteLessonNote(id: number): Promise<void> {
  return proxyDelete<void>(`/api/v1/lesson-notes/${id}`);
}
