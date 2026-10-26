import { proxyGet, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE, fetchAllPages } from '../lib/paginate';
import type { Assessment, Paginated, ResultSheet, Score, ScoreInput } from '../types';

export async function fetchAssessments(params: {
  classId?: number;
  subjectId?: number;
  termId?: number;
  status?: string;
}): Promise<Paginated<Assessment>> {
  const data = await fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<Assessment>>('/api/v1/assessments', {
      classId: params.classId === undefined ? undefined : String(params.classId),
      subjectId: params.subjectId === undefined ? undefined : String(params.subjectId),
      termId: params.termId === undefined ? undefined : String(params.termId),
      status: params.status,
      page: String(page),
      pageSize: String(pageSize),
    }),
  );
  return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
}

/** All scores for an assessment, following pagination. */
export function fetchScores(assessmentId: number): Promise<Score[]> {
  return fetchAllPages((page, pageSize) =>
    proxyGet<Paginated<Score>>(`/api/v1/assessments/${assessmentId}/scores`, {
      page: String(page),
      pageSize: String(pageSize),
    }),
  );
}

export async function fetchScoreCount(assessmentId: number): Promise<number> {
  const result = await proxyGet<Paginated<Score>>(`/api/v1/assessments/${assessmentId}/scores`, {
    page: '1',
    pageSize: '1',
  });
  return result.meta.total;
}

export function scoresPath(assessmentId: number): string {
  return `/api/v1/assessments/${assessmentId}/scores`;
}

export function putScores(
  assessmentId: number,
  scores: ScoreInput[],
): Promise<{ assessmentId: number; scores: Score[] }> {
  return proxyPut(scoresPath(assessmentId), { scores });
}

export function submitAssessment(id: number): Promise<Assessment> {
  return proxyPost<Assessment>(`/api/v1/assessments/${id}/submit`, {});
}

export function fetchResultSheets(params: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<ResultSheet>> {
  const pageSize = Math.min(params.pageSize ?? PAGE_SIZE, PAGE_SIZE);
  return proxyGet<Paginated<ResultSheet>>('/api/v1/result-sheets', {
    status: params.status,
    page: params.page === undefined ? undefined : String(params.page),
    pageSize: String(pageSize),
  });
}

/** All result sheets matching filters (pages of ≤10). */
export function fetchAllResultSheets(params: { status?: string } = {}): Promise<ResultSheet[]> {
  return fetchAllPages((page, pageSize) =>
    fetchResultSheets({ ...params, page, pageSize }),
  );
}

export function approveResultSheet(id: number, reason?: string): Promise<ResultSheet> {
  return proxyPost<ResultSheet>(`/api/v1/result-sheets/${id}/approve`, reason ? { reason } : {});
}

export function rejectResultSheet(id: number, reason: string): Promise<ResultSheet> {
  return proxyPost<ResultSheet>(`/api/v1/result-sheets/${id}/reject`, { reason });
}
