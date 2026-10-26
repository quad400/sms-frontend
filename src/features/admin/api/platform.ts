import { proxyDelete, proxyGet, proxyPatch, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type AuditLog = {
  id: number;
  action?: string;
  actorUserId?: number;
  actorName?: string;
  targetType?: string;
  targetId?: string | number;
  summary?: string;
  createdAt?: string;
  ip?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string;
};

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  licensed?: boolean;
  label?: string;
};

export type ReportDefinition = {
  key: string;
  name: string;
  description?: string | null;
  parameterSchema?: Record<string, unknown>;
};

export type ReportRun = {
  id: number;
  definitionKey?: string;
  status: string;
  createdAt?: string;
  downloadUrl?: string | null;
};

export type ReportSchedule = {
  id: number;
  definitionKey: string;
  cron?: string;
  recipients?: string[];
  isActive?: boolean;
};

export function listAuditLogs(params: {
  page?: number;
  action?: string;
  targetType?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
}): Promise<Paginated<AuditLog>> {
  return proxyGet('/api/v1/audit-logs', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    action: params.action,
    targetType: params.targetType,
    actorUserId: params.actorUserId,
    from: params.from,
    to: params.to,
  });
}

export function getAuditLog(id: number) {
  return proxyGet<AuditLog>(`/api/v1/audit-logs/${id}`);
}

export function exportAuditLogs(body?: Record<string, unknown>) {
  return proxyPost('/api/v1/audit-logs/exports', body ?? {});
}

export function listFeatureFlags() {
  return proxyGet<FeatureFlag[] | Paginated<FeatureFlag>>('/api/v1/feature-flags');
}

export function updateFeatureFlag(key: string, enabled: boolean) {
  return proxyPatch(`/api/v1/feature-flags/${key}`, { enabled });
}

export function listReportCatalogue() {
  return proxyGet<ReportDefinition[] | Paginated<ReportDefinition>>('/api/v1/reports/catalogue');
}

export function enqueueReportRun(body: { definitionKey: string; parameters?: Record<string, unknown> }) {
  return proxyPost<ReportRun>('/api/v1/reports/runs', body);
}

export function getReportRun(id: number) {
  return proxyGet<ReportRun>(`/api/v1/reports/runs/${id}`);
}

export function listReportSchedules() {
  return proxyGet<ReportSchedule[] | Paginated<ReportSchedule>>('/api/v1/reports/schedules');
}

export function createReportSchedule(body: Record<string, unknown>) {
  return proxyPost<ReportSchedule>('/api/v1/reports/schedules', body);
}

export function updateReportSchedule(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/reports/schedules/${id}`, body);
}

export function deleteReportSchedule(id: number) {
  return proxyDelete(`/api/v1/reports/schedules/${id}`);
}

export function getImportJob(id: number) {
  return proxyGet(`/api/v1/imports/${id}`);
}

export function getExportJob(id: number) {
  return proxyGet(`/api/v1/exports/${id}`);
}

export function createExport(body: Record<string, unknown>) {
  return proxyPost('/api/v1/exports', body);
}

export function listStudentConsents(studentId: number) {
  return proxyGet(`/api/v1/students/${studentId}/consents`);
}

export function recordConsent(studentId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/students/${studentId}/consents`, body);
}

export function createErasureRequest(studentId: number, reason: string) {
  return proxyPost(`/api/v1/students/${studentId}/erasure-requests`, { reason });
}
