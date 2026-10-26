'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  createCheckoutSession,
  fetchChildAttendance,
  fetchChildInvoices,
  fetchChildOverview,
  fetchChildReceipts,
  fetchChildReportCards,
  fetchChildResults,
  fetchChildTimetable,
  fetchFileDownloadUrl,
} from '../api/children';
import { parentKeys } from '../api/keys';
import type {
  AttendanceEntry,
  CheckoutSession,
  ChildInvoicesResponse,
  ParentChildOverview,
  Receipt,
  ReportCard,
  ResultTerm,
  TimetableSlot,
} from '../types';

export function useChildOverview(studentId: number | null) {
  return useQuery<ParentChildOverview, ApiClientError>({
    queryKey: parentKeys.overview(studentId ?? 0),
    queryFn: () => fetchChildOverview(studentId as number),
    enabled: studentId !== null,
  });
}

export function useChildAttendance(studentId: number | null, from: string, to: string) {
  return useQuery<AttendanceEntry[], ApiClientError>({
    queryKey: parentKeys.attendance(studentId ?? 0, from, to),
    queryFn: () => fetchChildAttendance(studentId as number, from, to),
    enabled: studentId !== null && Boolean(from && to),
  });
}

export function useChildResults(studentId: number | null) {
  return useQuery<ResultTerm[], ApiClientError>({
    queryKey: parentKeys.results(studentId ?? 0),
    queryFn: () => fetchChildResults(studentId as number),
    enabled: studentId !== null,
  });
}

export function useChildReportCards(studentId: number | null) {
  return useQuery<ReportCard[], ApiClientError>({
    queryKey: parentKeys.reportCards(studentId ?? 0),
    queryFn: () => fetchChildReportCards(studentId as number),
    enabled: studentId !== null,
  });
}

export function useChildTimetable(studentId: number | null) {
  return useQuery<TimetableSlot[], ApiClientError>({
    queryKey: parentKeys.timetable(studentId ?? 0),
    queryFn: () => fetchChildTimetable(studentId as number),
    enabled: studentId !== null,
  });
}

export function useChildInvoices(studentId: number | null) {
  return useQuery<ChildInvoicesResponse, ApiClientError>({
    queryKey: parentKeys.invoices(studentId ?? 0),
    queryFn: () => fetchChildInvoices(studentId as number),
    enabled: studentId !== null,
  });
}

export function useChildReceipts(studentId: number | null) {
  return useQuery<Receipt[], ApiClientError>({
    queryKey: parentKeys.receipts(studentId ?? 0),
    queryFn: () => fetchChildReceipts(studentId as number),
    enabled: studentId !== null,
  });
}

export function useCreateCheckout(studentId: number) {
  const queryClient = useQueryClient();
  return useMutation<
    CheckoutSession,
    ApiClientError,
    { invoiceId: number; providerKey: string; amountMinor?: number; idempotencyKey: string }
  >({
    mutationFn: ({ invoiceId, providerKey, amountMinor, idempotencyKey }) =>
      createCheckoutSession(studentId, invoiceId, { providerKey, amountMinor }, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentKeys.invoices(studentId) });
      void queryClient.invalidateQueries({ queryKey: parentKeys.receipts(studentId) });
      void queryClient.invalidateQueries({ queryKey: parentKeys.overview(studentId) });
    },
  });
}

export function useFileDownloadUrl(fileId: number | null) {
  return useQuery<{ url: string }, ApiClientError>({
    queryKey: parentKeys.downloadUrl(fileId ?? 0),
    queryFn: () => fetchFileDownloadUrl(fileId as number),
    enabled: fileId !== null,
  });
}
