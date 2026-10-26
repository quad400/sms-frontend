'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  createDocumentTemplate,
  getDocumentTemplate,
  listDocumentTemplates,
  previewDocumentTemplate,
  updateDocumentTemplate,
  type DocumentTemplate,
} from '../api/assessment';
import { getSettingsGroup, putSettingsGroup } from '../api/fees';
import { adminKeys } from '../api/keys';
import {
  createErasureRequest,
  createExport,
  createReportSchedule,
  deleteReportSchedule,
  enqueueReportRun,
  exportAuditLogs,
  getAuditLog,
  getReportRun,
  listAuditLogs,
  listFeatureFlags,
  listReportCatalogue,
  listReportSchedules,
  updateFeatureFlag,
  type AuditLog,
  type FeatureFlag,
  type ReportDefinition,
  type ReportRun,
  type ReportSchedule,
} from '../api/platform';
import type { Paginated } from '../types';

// ── Audit log ──────────────────────────────────────────────────────────

export function useAuditLogs(params: { page: number; action?: string; targetType?: string }) {
  return useQuery<Paginated<AuditLog>, ApiClientError>({
    queryKey: adminKeys.auditLogs({
      page: params.page,
      action: params.action ?? '',
      targetType: params.targetType ?? '',
    }),
    queryFn: () =>
      listAuditLogs({
        page: params.page,
        action: params.action || undefined,
        targetType: params.targetType || undefined,
      }),
  });
}

export function useAuditLog(id: number | null) {
  return useQuery<AuditLog, ApiClientError>({
    queryKey: adminKeys.auditLog(id ?? 0),
    queryFn: () => getAuditLog(id!),
    enabled: id != null,
  });
}

export function useExportAuditLogs() {
  return useMutation<unknown, ApiClientError, { action?: string; targetType?: string }>({
    mutationFn: (body) => exportAuditLogs(body),
  });
}

// ── Settings groups ────────────────────────────────────────────────────

export function useSettingsGroup(group: string) {
  return useQuery<{ group: string; value: Record<string, unknown> }, ApiClientError>({
    queryKey: adminKeys.settingsGroup(group),
    queryFn: () => getSettingsGroup(group),
  });
}

export function useSaveSettingsGroup(group: string) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, Record<string, unknown>>({
    mutationFn: (value) => putSettingsGroup(group, value),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.settingsGroup(group) }),
  });
}

// ── Feature flags ──────────────────────────────────────────────────────

export function useFeatureFlags() {
  return useQuery<FeatureFlag[] | Paginated<FeatureFlag>, ApiClientError>({
    queryKey: adminKeys.featureFlags(),
    queryFn: listFeatureFlags,
  });
}

export function useUpdateFeatureFlag() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, { key: string; enabled: boolean }>({
    mutationFn: ({ key, enabled }) => updateFeatureFlag(key, enabled),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.featureFlags() }),
  });
}

// ── Document templates ─────────────────────────────────────────────────

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

export function useSaveDocumentTemplate(typeCode: string) {
  const qc = useQueryClient();
  return useMutation<
    DocumentTemplate,
    ApiClientError,
    { id: number | null; name: string; html: string; css: string }
  >({
    mutationFn: ({ id, name, html, css }) =>
      id
        ? updateDocumentTemplate(id, { name, html, css })
        : createDocumentTemplate({ typeCode, name, html, css }),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.documentTemplates(typeCode) }),
  });
}

export function usePreviewDocumentTemplate() {
  return useMutation<unknown, ApiClientError, { id: number; data: Record<string, unknown> }>({
    mutationFn: ({ id, data }) => previewDocumentTemplate(id, data),
  });
}

// ── Reports ────────────────────────────────────────────────────────────

export function useReportCatalogue() {
  return useQuery<ReportDefinition[] | Paginated<ReportDefinition>, ApiClientError>({
    queryKey: adminKeys.reportCatalogue(),
    queryFn: listReportCatalogue,
  });
}

export function useReportSchedules() {
  return useQuery<ReportSchedule[] | Paginated<ReportSchedule>, ApiClientError>({
    queryKey: adminKeys.reportSchedules(),
    queryFn: listReportSchedules,
  });
}

export function useReportRun(runId: number | null) {
  return useQuery<ReportRun, ApiClientError>({
    queryKey: adminKeys.reportRun(runId ?? 0),
    queryFn: () => getReportRun(runId!),
    enabled: runId != null,
    refetchInterval: (q) => {
      const status = String(q.state.data?.status ?? '').toLowerCase();
      if (['completed', 'failed', 'cancelled'].includes(status)) return false;
      return 2000;
    },
  });
}

export function useEnqueueReportRun() {
  return useMutation<ReportRun, ApiClientError, { definitionKey: string }>({
    mutationFn: (body) => enqueueReportRun(body),
  });
}

export function useCreateReportSchedule() {
  const qc = useQueryClient();
  return useMutation<ReportSchedule, ApiClientError, { definitionKey: string; cron: string }>({
    mutationFn: ({ definitionKey, cron }) =>
      createReportSchedule({ definitionKey, cron, isActive: true }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.reportSchedules() }),
  });
}

export function useDeleteReportSchedule() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: deleteReportSchedule,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.reportSchedules() }),
  });
}

// ── Data jobs / protection ─────────────────────────────────────────────

export function useCreateExport() {
  return useMutation<unknown, ApiClientError, { entity: string }>({
    mutationFn: (body) => createExport(body),
  });
}

export function useCreateErasureRequest() {
  return useMutation<unknown, ApiClientError, { studentId: number; reason: string }>({
    mutationFn: ({ studentId, reason }) => createErasureRequest(studentId, reason),
  });
}
