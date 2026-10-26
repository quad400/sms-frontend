import { proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type GradingScale = {
  id: number;
  name: string;
  levelId?: number | null;
  campusId?: number | null;
  isDefault?: boolean;
  isActive?: boolean;
  bands?: Array<{
    minScore: number;
    maxScore: number;
    grade: string;
    remark?: string | null;
    gradePoint?: number | null;
  }>;
};

export type AssessmentScheme = {
  id: number;
  name: string;
  levelId: number;
  components?: Array<{
    id?: number;
    name: string;
    weight: number;
    maxScore: number;
    isExam?: boolean;
  }>;
};

export type ApprovalWorkflow = {
  levelId: number;
  levelName?: string;
  approverRoleIds: number[];
};

export type Assessment = {
  id: number;
  title: string;
  status: string;
  classId: number;
  subjectId: number;
  termId: number;
  componentId: number;
  componentName?: string;
  maxScore?: number;
  assessmentDate?: string | null;
  enteredCount?: number;
  classSize?: number;
  className?: string;
  subjectName?: string;
};

export type Score = {
  id: number;
  assessmentId: number;
  studentId: number;
  score: number | null;
  isAbsent: boolean;
  isLocked: boolean;
  studentName?: string;
  clientRef?: string | null;
};

export type ResultSheet = {
  id: number;
  status: string;
  classId: number;
  termId: number;
  className?: string;
  computedAt?: string | null;
  publishedAt?: string | null;
  students?: Array<Record<string, unknown>>;
  withheldStudentIds?: number[];
  publishedCount?: number;
  withheldCount?: number;
};

export type ReportCard = {
  id: number;
  studentId: number;
  classId?: number;
  termId?: number;
  status?: string;
  state?: string;
  generatedAt?: string | null;
  studentName?: string;
  pdfUrl?: string | null;
  signedUrl?: string | null;
};

export type DocumentTemplate = {
  id: number;
  typeCode: string;
  name: string;
  html?: string;
  css?: string | null;
  isActive?: boolean;
  version?: number;
};

async function asList<T>(res: Paginated<T> | T[]): Promise<T[]> {
  return Array.isArray(res) ? res : (res.data ?? []);
}

export async function listGradingScales(): Promise<GradingScale[]> {
  return asList(await proxyGet('/api/v1/grading-scales'));
}

export function getGradingScale(id: number) {
  return proxyGet<GradingScale>(`/api/v1/grading-scales/${id}`);
}

export function createGradingScale(body: Record<string, unknown>) {
  return proxyPost<GradingScale>('/api/v1/grading-scales', body);
}

export function updateGradingScale(id: number, body: Record<string, unknown>) {
  return proxyPut<GradingScale>(`/api/v1/grading-scales/${id}`, body);
}

export async function listSchemes(): Promise<AssessmentScheme[]> {
  return asList(await proxyGet('/api/v1/assessment-schemes'));
}

export function createScheme(body: Record<string, unknown>) {
  return proxyPost<AssessmentScheme>('/api/v1/assessment-schemes', body);
}

export function updateScheme(id: number, body: Record<string, unknown>) {
  return proxyPut<AssessmentScheme>(`/api/v1/assessment-schemes/${id}`, body);
}

export async function listWorkflows(): Promise<ApprovalWorkflow[]> {
  return asList(await proxyGet('/api/v1/approval-workflows'));
}

export function putWorkflow(levelId: number, approverRoleIds: number[]) {
  return proxyPut(`/api/v1/approval-workflows/${levelId}`, { approverRoleIds });
}

export function listAssessments(params: {
  page?: number;
  classId?: string;
  termId?: string;
  subjectId?: string;
  status?: string;
}): Promise<Paginated<Assessment>> {
  return proxyGet('/api/v1/assessments', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    classId: params.classId,
    termId: params.termId,
    subjectId: params.subjectId,
    status: params.status,
  });
}

export function getAssessment(id: number) {
  return proxyGet<Assessment>(`/api/v1/assessments/${id}`);
}

export function createAssessment(body: Record<string, unknown>) {
  return proxyPost<Assessment>('/api/v1/assessments', body);
}

export function listScores(assessmentId: number): Promise<Score[] | Paginated<Score>> {
  return proxyGet(`/api/v1/assessments/${assessmentId}/scores`);
}

export function putScores(assessmentId: number, scores: Array<Record<string, unknown>>) {
  return proxyPut(`/api/v1/assessments/${assessmentId}/scores`, { scores });
}

export function submitAssessment(id: number) {
  return proxyPost(`/api/v1/assessments/${id}/submit`, {});
}

export function patchLockedScore(
  scoreId: number,
  body: { score?: number; isAbsent?: boolean; reason: string },
) {
  return proxyPatch(`/api/v1/scores/${scoreId}`, body);
}

export function listResultSheets(params: {
  page?: number;
  classId?: string;
  termId?: string;
  status?: string;
}): Promise<Paginated<ResultSheet>> {
  return proxyGet('/api/v1/result-sheets', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    classId: params.classId,
    termId: params.termId,
    status: params.status,
  });
}

export function getResultSheet(id: number) {
  return proxyGet<ResultSheet>(`/api/v1/result-sheets/${id}`);
}

export function computeResultSheet(id: number) {
  return proxyPost(`/api/v1/result-sheets/${id}/compute`, {});
}

export function approveResultSheet(id: number, reason?: string) {
  return proxyPost(`/api/v1/result-sheets/${id}/approve`, { reason });
}

export function rejectResultSheet(id: number, reason: string) {
  return proxyPost(`/api/v1/result-sheets/${id}/reject`, { reason });
}

export function publishResultSheet(id: number) {
  return proxyPost(`/api/v1/result-sheets/${id}/publish`, {});
}

export function listReportCards(params: {
  page?: number;
  classId?: string;
  termId?: string;
  studentId?: string;
}): Promise<Paginated<ReportCard>> {
  return proxyGet('/api/v1/report-cards', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    classId: params.classId,
    termId: params.termId,
    studentId: params.studentId,
  });
}

export function getReportCard(id: number) {
  return proxyGet<ReportCard>(`/api/v1/report-cards/${id}`);
}

export function regenerateReportCard(id: number, templateId?: number) {
  return proxyPost(`/api/v1/report-cards/${id}/regenerate`, { templateId });
}

export async function listDocumentTemplates(typeCode?: string): Promise<DocumentTemplate[]> {
  return asList(
    await proxyGet('/api/v1/document-templates', {
      type: typeCode,
      typeCode,
      page: '1',
      pageSize: String(PAGE_SIZE),
    }),
  );
}

export function getDocumentTemplate(id: number) {
  return proxyGet<DocumentTemplate>(`/api/v1/document-templates/${id}`);
}

export function createDocumentTemplate(body: Record<string, unknown>) {
  return proxyPost<DocumentTemplate>('/api/v1/document-templates', body);
}

export function updateDocumentTemplate(id: number, body: Record<string, unknown>) {
  return proxyPatch<DocumentTemplate>(`/api/v1/document-templates/${id}`, body);
}

export function previewDocumentTemplate(id: number, data: Record<string, unknown>) {
  return proxyPost(`/api/v1/document-templates/${id}/preview`, { data });
}
