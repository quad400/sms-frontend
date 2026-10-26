'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  awardScholarship,
  batchInvoices,
  cancelInvoice,
  createAdjustment,
  createCheckoutSession,
  createCreditNote,
  createDiscount,
  createFeeStructure,
  createInvoice,
  createScholarship,
  dismissException,
  getFeeStructure,
  getInvoice,
  getSettingsGroup,
  getStudentAccount,
  importBankStatement,
  issueInvoice,
  listDebtors,
  listDiscounts,
  listFeeItems,
  listFeeStructures,
  listInvoices,
  listPayments,
  listReconciliationExceptions,
  listScholarships,
  matchException,
  putSettingsGroup,
  recordPayment,
  resendReceipt,
  sendDebtorReminders,
  updateFeeStructure,
  type DebtorRow,
  type Discount,
  type FeeItem,
  type FeeStructure,
  type Invoice,
  type Payment,
  type ReconciliationException,
  type Scholarship,
  type StudentAccount,
} from '../api/fees';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

/* ── Fee structures & items ─────────────────────────────────── */

export function useFeeStructures(params: { page: number; campusId?: string }) {
  return useQuery<Paginated<FeeStructure>, ApiClientError>({
    queryKey: adminKeys.feeStructures({ page: params.page, campusId: params.campusId }),
    queryFn: () => listFeeStructures({ page: params.page, campusId: params.campusId }),
  });
}

export function useFeeStructure(id: number | null) {
  return useQuery<FeeStructure, ApiClientError>({
    queryKey: adminKeys.feeStructure(id ?? 0),
    queryFn: () => getFeeStructure(id!),
    enabled: id != null,
  });
}

export function useFeeItems() {
  return useQuery<FeeItem[], ApiClientError>({
    queryKey: adminKeys.feeItems(),
    queryFn: listFeeItems,
  });
}

export function useCreateFeeStructure() {
  const qc = useQueryClient();
  return useMutation<FeeStructure, ApiClientError, Record<string, unknown>>({
    mutationFn: createFeeStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.feeStructures({}) }),
  });
}

export function useUpdateFeeStructure() {
  const qc = useQueryClient();
  return useMutation<
    FeeStructure,
    ApiClientError,
    { id: number; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) => updateFeeStructure(id, body),
    onSuccess: (_row, { id }) =>
      qc.invalidateQueries({ queryKey: adminKeys.feeStructure(id) }),
  });
}

/* ── Discounts & scholarships ───────────────────────────────── */

export function useDiscounts() {
  return useQuery<Discount[], ApiClientError>({
    queryKey: adminKeys.discounts(),
    queryFn: listDiscounts,
  });
}

export function useScholarships() {
  return useQuery<Scholarship[], ApiClientError>({
    queryKey: adminKeys.scholarships(),
    queryFn: listScholarships,
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation<Discount, ApiClientError, Record<string, unknown>>({
    mutationFn: createDiscount,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.discounts() }),
  });
}

export function useCreateScholarship() {
  const qc = useQueryClient();
  return useMutation<Scholarship, ApiClientError, Record<string, unknown>>({
    mutationFn: createScholarship,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.scholarships() }),
  });
}

export function useAwardScholarship() {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    { id: number; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) => awardScholarship(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.scholarships() }),
  });
}

/* ── Invoices ───────────────────────────────────────────────── */

export function useInvoices(params: {
  page: number;
  status?: string;
  q?: string;
  campusId?: string;
}) {
  return useQuery<Paginated<Invoice>, ApiClientError>({
    queryKey: adminKeys.invoices({
      page: params.page,
      status: params.status ?? '',
      q: params.q ?? '',
      campusId: params.campusId,
    }),
    queryFn: () =>
      listInvoices({
        page: params.page,
        status: params.status || undefined,
        q: params.q || undefined,
        campusId: params.campusId,
      }),
  });
}

export function useInvoice(id: number) {
  return useQuery<Invoice, ApiClientError>({
    queryKey: adminKeys.invoice(id),
    queryFn: () => getInvoice(id),
  });
}

/** Creates an invoice and optionally issues it straight away. */
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation<
    Invoice,
    ApiClientError,
    { body: Record<string, unknown>; issue: boolean }
  >({
    mutationFn: async ({ body, issue }) => {
      const inv = await createInvoice(body);
      if (issue) await issueInvoice(inv.id);
      return inv;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.invoices({}) }),
  });
}

export function useBatchInvoices() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, Record<string, unknown>>({
    mutationFn: batchInvoices,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.invoices({}) }),
  });
}

function useInvalidateInvoice(invoiceId: number) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: adminKeys.invoice(invoiceId) });
}

export function useIssueInvoice(invoiceId: number) {
  const invalidate = useInvalidateInvoice(invoiceId);
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => issueInvoice(invoiceId),
    onSuccess: invalidate,
  });
}

export function useRecordPayment(invoiceId: number) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    { body: Record<string, unknown>; idempotencyKey: string }
  >({
    mutationFn: ({ body, idempotencyKey }) => recordPayment(invoiceId, body, idempotencyKey),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: adminKeys.invoice(invoiceId) }),
        qc.invalidateQueries({ queryKey: adminKeys.payments({}) }),
      ]),
  });
}

export function useCreateCheckoutSession(invoiceId: number) {
  return useMutation<
    unknown,
    ApiClientError,
    { body: Record<string, unknown>; idempotencyKey: string }
  >({
    mutationFn: ({ body, idempotencyKey }) =>
      createCheckoutSession(invoiceId, body, idempotencyKey),
  });
}

export function useCancelInvoice(invoiceId: number) {
  const invalidate = useInvalidateInvoice(invoiceId);
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (reason) => cancelInvoice(invoiceId, reason),
    onSuccess: invalidate,
  });
}

export function useCreateCreditNote(invoiceId: number) {
  const invalidate = useInvalidateInvoice(invoiceId);
  return useMutation<unknown, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) => createCreditNote(invoiceId, body),
    onSuccess: invalidate,
  });
}

export function useCreateAdjustment(invoiceId: number) {
  const invalidate = useInvalidateInvoice(invoiceId);
  return useMutation<unknown, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) => createAdjustment(invoiceId, body),
    onSuccess: invalidate,
  });
}

/* ── Payments ───────────────────────────────────────────────── */

export function usePayments(params: { page: number; campusId?: string }) {
  return useQuery<Paginated<Payment>, ApiClientError>({
    queryKey: adminKeys.payments({ page: params.page, campusId: params.campusId }),
    queryFn: () => listPayments({ page: params.page, campusId: params.campusId }),
  });
}

export function useResendReceipt() {
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: resendReceipt,
  });
}

/* ── Reconciliation ─────────────────────────────────────────── */

export function useReconciliationExceptions(params: { page: number }) {
  return useQuery<Paginated<ReconciliationException>, ApiClientError>({
    queryKey: adminKeys.reconciliation({ page: params.page }),
    queryFn: () => listReconciliationExceptions({ page: params.page }),
  });
}

function useInvalidateReconciliation() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: adminKeys.reconciliation({}) });
}

export function useMatchException() {
  const invalidate = useInvalidateReconciliation();
  return useMutation<unknown, ApiClientError, { id: number; invoiceId: number }>({
    mutationFn: ({ id, invoiceId }) => matchException(id, invoiceId),
    onSuccess: invalidate,
  });
}

export function useDismissException() {
  const invalidate = useInvalidateReconciliation();
  return useMutation<unknown, ApiClientError, { id: number; reason: string }>({
    mutationFn: ({ id, reason }) => dismissException(id, reason),
    onSuccess: invalidate,
  });
}

export function useImportBankStatement() {
  const invalidate = useInvalidateReconciliation();
  return useMutation<unknown, ApiClientError, Record<string, unknown>>({
    mutationFn: importBankStatement,
    onSuccess: invalidate,
  });
}

/* ── Debtors ────────────────────────────────────────────────── */

export function useDebtors(params: { page: number; campusId?: string }, enabled = true) {
  return useQuery<Paginated<DebtorRow>, ApiClientError>({
    queryKey: adminKeys.debtors({ page: params.page, campusId: params.campusId }),
    queryFn: () => listDebtors({ page: params.page, campusId: params.campusId }),
    enabled,
  });
}

export function useSendDebtorReminders() {
  return useMutation<unknown, ApiClientError, { studentIds: number[] }>({
    mutationFn: (body) => sendDebtorReminders(body),
  });
}

/* ── Settings (fee clearance) & student account ─────────────── */

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
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.settingsGroup(group) }),
  });
}

export function useStudentAccount(studentId: number) {
  return useQuery<StudentAccount, ApiClientError>({
    queryKey: adminKeys.studentAccount(studentId),
    queryFn: () => getStudentAccount(studentId),
  });
}
