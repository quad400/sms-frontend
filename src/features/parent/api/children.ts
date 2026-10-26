import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';
import type {
  AttendanceEntry,
  CheckoutSession,
  ChildInvoicesResponse,
  ParentChild,
  ParentChildOverview,
  Receipt,
  ReportCard,
  ResultTerm,
  TimetableSlot,
} from '../types';

export function fetchChildren(): Promise<ParentChild[]> {
  return proxyGet<ParentChild[]>('/api/v1/portal/children');
}

export function fetchChildOverview(studentId: number): Promise<ParentChildOverview> {
  return proxyGet<ParentChildOverview>(`/api/v1/portal/children/${studentId}/overview`);
}

export function fetchChildAttendance(
  studentId: number,
  from: string,
  to: string,
): Promise<AttendanceEntry[]> {
  return proxyGet<AttendanceEntry[]>(`/api/v1/portal/children/${studentId}/attendance`, {
    from,
    to,
  });
}

export function fetchChildResults(studentId: number): Promise<ResultTerm[]> {
  return proxyGet<ResultTerm[]>(`/api/v1/portal/children/${studentId}/results`);
}

export function fetchChildReportCards(studentId: number): Promise<ReportCard[]> {
  return proxyGet<ReportCard[]>(`/api/v1/portal/children/${studentId}/report-cards`);
}

export function fetchChildTimetable(studentId: number): Promise<TimetableSlot[]> {
  return proxyGet<TimetableSlot[]>(`/api/v1/portal/children/${studentId}/timetable`);
}

export function fetchChildInvoices(studentId: number): Promise<ChildInvoicesResponse> {
  return proxyGet<ChildInvoicesResponse>(`/api/v1/portal/children/${studentId}/invoices`);
}

export function fetchChildReceipts(studentId: number): Promise<Receipt[]> {
  return proxyGet<Receipt[]>(`/api/v1/portal/children/${studentId}/receipts`);
}

export function createCheckoutSession(
  studentId: number,
  invoiceId: number,
  body: { providerKey: string; amountMinor?: number },
  idempotencyKey: string,
): Promise<CheckoutSession> {
  return proxyPost<CheckoutSession>(
    `/api/v1/portal/children/${studentId}/invoices/${invoiceId}/checkout-sessions`,
    body,
    { 'Idempotency-Key': idempotencyKey },
  );
}

export function fetchFileDownloadUrl(fileId: number): Promise<{ url: string }> {
  return proxyGet<{ url: string }>(`/api/v1/files/${fileId}/download-url`);
}
