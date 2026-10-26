'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  approveResultSheet,
  computeResultSheet,
  createDocumentTemplate,
  createGradingScale,
  createScheme,
  getAssessment,
  getDocumentTemplate,
  getGradingScale,
  getReportCard,
  getResultSheet,
  listAssessments,
  listDocumentTemplates,
  listGradingScales,
  listReportCards,
  listResultSheets,
  listSchemes,
  listScores,
  listWorkflows,
  patchLockedScore,
  previewDocumentTemplate,
  publishResultSheet,
  putWorkflow,
  regenerateReportCard,
  rejectResultSheet,
  submitAssessment,
  updateDocumentTemplate,
  updateGradingScale,
  updateScheme,
  type ApprovalWorkflow,
  type Assessment,
  type AssessmentScheme,
  type DocumentTemplate,
  type GradingScale,
  type ReportCard,
  type ResultSheet,
  type Score,
} from '../api/assessment';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

/* ── Grading scales ─────────────────────────────────────────── */

export function useGradingScales() {
  return useQuery<GradingScale[], ApiClientError>({
    queryKey: adminKeys.gradingScales(),
    queryFn: listGradingScales,
  });
}

export function useGradingScale(id: number | null) {
  return useQuery<GradingScale, ApiClientError>({
    queryKey: adminKeys.gradingScale(id ?? 0),
    queryFn: () => getGradingScale(id!),
    enabled: id != null,
  });
}

/** Creates a scale when `id` is null, otherwise updates it. */
export function useSaveGradingScale() {
  const qc = useQueryClient();
  return useMutation<
    GradingScale,
    ApiClientError,
    { id: number | null; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) =>
      id ? updateGradingScale(id, body) : createGradingScale(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.gradingScales() }),
  });
}

export function useDuplicateGradingScale() {
  const qc = useQueryClient();
  return useMutation<GradingScale, ApiClientError, Record<string, unknown>>({
    mutationFn: createGradingScale,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.gradingScales() }),
  });
}

/* ── Schemes ────────────────────────────────────────────────── */

export function useSchemes() {
  return useQuery<AssessmentScheme[], ApiClientError>({
    queryKey: adminKeys.schemes(),
    queryFn: listSchemes,
  });
}

/** Creates a scheme when `id` is null, otherwise updates it. */
export function useSaveScheme() {
  const qc = useQueryClient();
  return useMutation<
    AssessmentScheme,
    ApiClientError,
    { id: number | null; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) => (id ? updateScheme(id, body) : createScheme(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.schemes() }),
  });
}

/* ── Approval workflows ─────────────────────────────────────── */

export function useWorkflows() {
  return useQuery<ApprovalWorkflow[], ApiClientError>({
    queryKey: adminKeys.workflows(),
    queryFn: listWorkflows,
  });
}

export function useSaveWorkflow() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, { levelId: number; roleIds: number[] }>({
    mutationFn: ({ levelId, roleIds }) => putWorkflow(levelId, roleIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.workflows() }),
  });
}

/* ── Assessments & scores ───────────────────────────────────── */

export function useAssessments(params: { page: number; status?: string }) {
  return useQuery<Paginated<Assessment>, ApiClientError>({
    queryKey: adminKeys.assessments({ page: params.page, status: params.status ?? '' }),
    queryFn: () => listAssessments({ page: params.page, status: params.status || undefined }),
  });
}

export function useAssessment(id: number) {
  return useQuery<Assessment, ApiClientError>({
    queryKey: adminKeys.assessment(id),
    queryFn: () => getAssessment(id),
  });
}

export function useScores(assessmentId: number) {
  return useQuery<Score[], ApiClientError>({
    queryKey: adminKeys.scores(assessmentId),
    queryFn: async () => {
      const res = await listScores(assessmentId);
      return Array.isArray(res) ? res : (res.data ?? []);
    },
  });
}

export function usePatchLockedScore(assessmentId: number) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    { scoreId: number; score: number; reason: string }
  >({
    mutationFn: ({ scoreId, score, reason }) => patchLockedScore(scoreId, { score, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.scores(assessmentId) }),
  });
}

export function useSubmitAssessment(assessmentId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => submitAssessment(assessmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.assessment(assessmentId) }),
  });
}

/* ── Result sheets ──────────────────────────────────────────── */

export function useResultSheets(params: { page: number; status?: string }) {
  return useQuery<Paginated<ResultSheet>, ApiClientError>({
    queryKey: adminKeys.resultSheets({ page: params.page, status: params.status ?? '' }),
    queryFn: () => listResultSheets({ page: params.page, status: params.status || undefined }),
  });
}

export function useResultSheet(id: number) {
  return useQuery<ResultSheet, ApiClientError>({
    queryKey: adminKeys.resultSheet(id),
    queryFn: () => getResultSheet(id),
  });
}

function useInvalidateResultSheet(sheetId: number) {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: adminKeys.resultSheet(sheetId) }),
      qc.invalidateQueries({ queryKey: adminKeys.resultSheets({}) }),
    ]);
}

export function useComputeResultSheet(sheetId: number) {
  const invalidate = useInvalidateResultSheet(sheetId);
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => computeResultSheet(sheetId),
    onSuccess: invalidate,
  });
}

export function useApproveResultSheet(sheetId: number) {
  const invalidate = useInvalidateResultSheet(sheetId);
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => approveResultSheet(sheetId),
    onSuccess: invalidate,
  });
}

export function useRejectResultSheet(sheetId: number) {
  const invalidate = useInvalidateResultSheet(sheetId);
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (reason) => rejectResultSheet(sheetId, reason),
    onSuccess: invalidate,
  });
}

export function usePublishResultSheet(sheetId: number) {
  const invalidate = useInvalidateResultSheet(sheetId);
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => publishResultSheet(sheetId),
    onSuccess: invalidate,
  });
}

/* ── Report cards ───────────────────────────────────────────── */

export function useReportCards(params: { page: number }) {
  return useQuery<Paginated<ReportCard>, ApiClientError>({
    queryKey: adminKeys.reportCards({ page: params.page }),
    queryFn: () => listReportCards({ page: params.page }),
  });
}

export function useReportCard(id: number | null) {
  return useQuery<ReportCard, ApiClientError>({
    queryKey: adminKeys.reportCard(id ?? 0),
    queryFn: () => getReportCard(id!),
    enabled: id != null,
  });
}

export function useRegenerateReportCard() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: (id) => regenerateReportCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.reportCards({}) }),
  });
}

/* ── Document templates ─────────────────────────────────────── */

export function useDocumentTemplates(typeCode: string) {
  return useQuery<DocumentTemplate[], ApiClientError>({
    queryKey: adminKeys.documentTemplates(typeCode),
    queryFn: () => listDocumentTemplates(typeCode),
  });
}

export function useDocumentTemplate(id: number | null) {
  return useQuery<DocumentTemplate, ApiClientError>({
    queryKey: adminKeys.documentTemplate(id ?? 0),
    queryFn: () => getDocumentTemplate(id!),
    enabled: id != null,
  });
}

/** Creates a template when `id` is null, otherwise updates it. */
export function useSaveDocumentTemplate(typeCode: string) {
  const qc = useQueryClient();
  return useMutation<
    DocumentTemplate,
    ApiClientError,
    { id: number | null; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) =>
      id ? updateDocumentTemplate(id, body) : createDocumentTemplate({ typeCode, ...body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.documentTemplates(typeCode) }),
  });
}

export function usePreviewDocumentTemplate() {
  return useMutation<
    unknown,
    ApiClientError,
    { id: number; data: Record<string, unknown> }
  >({
    mutationFn: ({ id, data }) => previewDocumentTemplate(id, data),
  });
}
