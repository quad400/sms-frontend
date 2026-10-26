import { proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type FeeStructure = {
  id: number;
  name: string;
  levelId?: number;
  termId?: number;
  sessionId?: number;
  campusId?: number;
  version?: number;
  totalMinor?: number;
  currency?: string;
  isCurrent?: boolean;
  invoiceCount?: number;
  items?: Array<{ feeItemId: number; amountMinor: number; currency?: string; name?: string }>;
};

export type FeeItem = { id: number; name: string; code?: string; isActive?: boolean };
export type Discount = {
  id: number;
  name: string;
  type: string;
  value: number;
  isActive?: boolean;
};
export type Scholarship = {
  id: number;
  name: string;
  sponsor?: string | null;
  discountId?: number;
  awardCount?: number;
};

export type Invoice = {
  id: number;
  number?: string;
  invoiceNumber?: string;
  studentId: number;
  studentName?: string;
  termId?: number;
  status: string;
  totalMinor?: number;
  paidMinor?: number;
  balanceMinor?: number;
  dueDate?: string | null;
  currency?: string;
  lines?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
};

export type Payment = {
  id: number;
  invoiceId?: number;
  studentId?: number;
  studentName?: string;
  method?: string;
  amountMinor: number;
  status?: string;
  paidAt?: string;
  receiptNumber?: string;
  receiptUrl?: string | null;
};

export type ReconciliationException = {
  id: number;
  amountMinor: number;
  reference?: string | null;
  date?: string;
  status?: string;
  source?: string;
  suggestedInvoiceIds?: number[];
};

export type DebtorRow = {
  studentId: number;
  studentName?: string;
  balanceMinor: number;
  overdueMinor?: number;
  className?: string;
};

export type StudentAccount = {
  studentId: number;
  balanceMinor: number;
  currency?: string;
  entries?: Array<Record<string, unknown>>;
  statementUrl?: string | null;
};

async function asList<T>(res: Paginated<T> | T[]): Promise<T[]> {
  return Array.isArray(res) ? res : (res.data ?? []);
}

export async function listFeeItems(): Promise<FeeItem[]> {
  return asList(await proxyGet('/api/v1/fee-items', { page: '1', pageSize: String(PAGE_SIZE) }));
}

export function createFeeItem(body: Record<string, unknown>) {
  return proxyPost<FeeItem>('/api/v1/fee-items', body);
}

export function listFeeStructures(params: {
  page?: number;
  campusId?: string;
  termId?: string;
}): Promise<Paginated<FeeStructure>> {
  return proxyGet('/api/v1/fee-structures', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    campusId: params.campusId,
    termId: params.termId,
  });
}

export function getFeeStructure(id: number) {
  return proxyGet<FeeStructure>(`/api/v1/fee-structures/${id}`);
}

export function createFeeStructure(body: Record<string, unknown>) {
  return proxyPost<FeeStructure>('/api/v1/fee-structures', body);
}

export function updateFeeStructure(id: number, body: Record<string, unknown>) {
  return proxyPut<FeeStructure>(`/api/v1/fee-structures/${id}`, body);
}

export async function listDiscounts(): Promise<Discount[]> {
  return asList(await proxyGet('/api/v1/discounts', { page: '1', pageSize: String(PAGE_SIZE) }));
}

export function createDiscount(body: Record<string, unknown>) {
  return proxyPost<Discount>('/api/v1/discounts', body);
}

export function updateDiscount(id: number, body: Record<string, unknown>) {
  return proxyPatch<Discount>(`/api/v1/discounts/${id}`, body);
}

export async function listScholarships(): Promise<Scholarship[]> {
  return asList(await proxyGet('/api/v1/scholarships', { page: '1', pageSize: String(PAGE_SIZE) }));
}

export function createScholarship(body: Record<string, unknown>) {
  return proxyPost<Scholarship>('/api/v1/scholarships', body);
}

export function awardScholarship(id: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/scholarships/${id}/awards`, body);
}

export function listInvoices(params: {
  page?: number;
  status?: string;
  q?: string;
  classId?: string;
  termId?: string;
  campusId?: string;
}): Promise<Paginated<Invoice>> {
  return proxyGet('/api/v1/invoices', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    status: params.status,
    q: params.q,
    classId: params.classId,
    termId: params.termId,
    campusId: params.campusId,
  });
}

export function getInvoice(id: number) {
  return proxyGet<Invoice>(`/api/v1/invoices/${id}`);
}

export function createInvoice(body: Record<string, unknown>) {
  return proxyPost<Invoice>('/api/v1/invoices', body);
}

export function issueInvoice(id: number) {
  return proxyPost(`/api/v1/invoices/${id}/issue`, {});
}

export function cancelInvoice(id: number, reason: string) {
  return proxyPost(`/api/v1/invoices/${id}/cancel`, { reason });
}

export function createCreditNote(id: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/invoices/${id}/credit-notes`, body);
}

export function createAdjustment(id: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/invoices/${id}/adjustments`, body);
}

export function batchInvoices(body: Record<string, unknown>) {
  return proxyPost('/api/v1/invoices/batches', body);
}

export function recordPayment(invoiceId: number, body: Record<string, unknown>, idempotencyKey: string) {
  return proxyPost(`/api/v1/invoices/${invoiceId}/payments`, body, {
    'Idempotency-Key': idempotencyKey,
  });
}

export function createCheckoutSession(invoiceId: number, body: Record<string, unknown>, idempotencyKey: string) {
  return proxyPost(`/api/v1/invoices/${invoiceId}/checkout-sessions`, body, {
    'Idempotency-Key': idempotencyKey,
  });
}

export function listPayments(params: {
  page?: number;
  method?: string;
  status?: string;
  campusId?: string;
}): Promise<Paginated<Payment>> {
  return proxyGet('/api/v1/payments', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    method: params.method,
    status: params.status,
    campusId: params.campusId,
  });
}

export function getPayment(id: number) {
  return proxyGet<Payment>(`/api/v1/payments/${id}`);
}

export function getPaymentReceipt(id: number) {
  return proxyGet<{ url?: string }>(`/api/v1/payments/${id}/receipt`);
}

export function resendReceipt(id: number) {
  return proxyPost(`/api/v1/payments/${id}/receipt/resend`, {});
}

export function listReconciliationExceptions(params: { page?: number }): Promise<Paginated<ReconciliationException>> {
  return proxyGet('/api/v1/reconciliation/exceptions', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function matchException(id: number, invoiceId: number) {
  return proxyPost(`/api/v1/reconciliation/exceptions/${id}/match`, { invoiceId });
}

export function dismissException(id: number, reason: string) {
  return proxyPost(`/api/v1/reconciliation/exceptions/${id}/dismiss`, { reason });
}

export function importBankStatement(body: Record<string, unknown>) {
  return proxyPost('/api/v1/reconciliation/bank-statements', body);
}

export function listDebtors(params: {
  page?: number;
  campusId?: string;
}): Promise<Paginated<DebtorRow>> {
  return proxyGet('/api/v1/debtors', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    campusId: params.campusId,
  });
}

export function sendDebtorReminders(body: Record<string, unknown>) {
  return proxyPost('/api/v1/debtors/reminders', body);
}

export function getFeeClearance(studentId: number) {
  return proxyGet(`/api/v1/students/${studentId}/fee-clearance`);
}

export function getStudentAccount(studentId: number) {
  return proxyGet<StudentAccount>(`/api/v1/students/${studentId}/account`);
}

export function getSettingsGroup(group: string) {
  return proxyGet<{ group: string; value: Record<string, unknown> }>(`/api/v1/settings/${group}`);
}

export function putSettingsGroup(group: string, value: Record<string, unknown>) {
  return proxyPut(`/api/v1/settings/${group}`, { value });
}
