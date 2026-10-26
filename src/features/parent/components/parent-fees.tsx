'use client';

import { useMemo, useRef, useState } from 'react';
import { ChevronDown, Download, Receipt } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { formatMoneyMinor } from '@/lib/money/format';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { fetchFileDownloadUrl } from '../api/children';
import { useChildInvoices, useChildReceipts, useCreateCheckout } from '../hooks/use-child-data';
import { childName, formatDate, statusLabel } from '../lib/format';
import { QueryState } from '../lib/shared';
import type { Invoice, ParentChild } from '../types';

type Tab = 'invoices' | 'receipts';

const TABS = [
  { value: 'invoices' as const, label: 'Invoices' },
  { value: 'receipts' as const, label: 'Payments & receipts' },
];

const PAYABLE = new Set(['issued', 'partially-paid', 'partially_paid', 'overdue', 'open']);

function outstandingOf(invoice: Invoice): number {
  const total = invoice.totalMinor ?? invoice.amountMinor ?? 0;
  const paid = invoice.amountPaidMinor ?? 0;
  return Math.max(0, total - paid);
}

function isPayable(invoice: Invoice): boolean {
  const status = (invoice.status ?? invoice.statusCode ?? '').toLowerCase();
  return PAYABLE.has(status) && outstandingOf(invoice) > 0;
}

function newIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ParentFees({
  studentId,
  child,
}: {
  studentId: number;
  child: ParentChild | null;
}) {
  const invoicesQuery = useChildInvoices(studentId);
  const receiptsQuery = useChildReceipts(studentId);
  const checkout = useCreateCheckout(studentId);
  const [tab, setTab] = useState<Tab>('invoices');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const idempotencyRef = useRef<string>(newIdempotencyKey());

  const balances = invoicesQuery.data?.balances ?? [];
  const invoices = invoicesQuery.data?.invoices ?? [];
  const receipts = receiptsQuery.data ?? [];
  const payable = useMemo(() => invoices.filter(isPayable), [invoices]);
  const selected =
    (selectedId !== null ? payable.find((row) => row.id === selectedId) : null) ??
    payable.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))[0] ??
    null;
  const primaryBalance = balances.find((row) => row.outstandingMinor > 0) ?? balances[0];
  const owing = primaryBalance?.outstandingMinor ?? 0;

  async function pay(invoice: Invoice): Promise<void> {
    try {
      const session = await checkout.mutateAsync({
        invoiceId: invoice.id,
        providerKey: 'paystack',
        amountMinor: outstandingOf(invoice),
        idempotencyKey: idempotencyRef.current,
      });
      if (!session.authorizationUrl) {
        toastError('Checkout unavailable', 'The payment gateway did not return a URL.');
        idempotencyRef.current = newIdempotencyKey();
        return;
      }
      window.location.assign(session.authorizationUrl);
    } catch (error) {
      idempotencyRef.current = newIdempotencyKey();
      toastError(
        'Could not start payment',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fees"
        description={child ? `Invoices and receipts for ${childName(child)}.` : 'Invoices and receipts.'}
      />

      <QueryState
        isPending={invoicesQuery.isPending}
        error={invoicesQuery.error}
        onRetry={() => void invoicesQuery.refetch()}
      >
        <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="font-heading text-3xl font-semibold tabular-nums">
              {primaryBalance
                ? formatMoneyMinor(Math.max(0, primaryBalance.outstandingMinor), primaryBalance.currency)
                : '—'}
            </p>
            {owing > 0 && selected ? (
              <Button
                type="button"
                disabled={checkout.isPending}
                onClick={() => void pay(selected)}
              >
                {checkout.isPending ? 'Starting…' : 'Pay now'}
              </Button>
            ) : null}
          </div>
          {selected?.dueDate ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Paying invoice due {formatDate(selected.dueDate)}
            </p>
          ) : null}
        </section>

        <SegmentedControl value={tab} onValueChange={setTab} options={TABS} aria-label="Fees section" />

        {tab === 'invoices' ? (
          <ul className="grid gap-2">
            {invoices.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No invoices yet.
              </p>
            ) : (
              invoices.map((invoice) => {
                const open = expanded === invoice.id;
                const payableRow = isPayable(invoice);
                return (
                  <li
                    key={invoice.id}
                    className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-4 text-left"
                      onClick={() => {
                        setExpanded(open ? null : invoice.id);
                        if (payableRow) setSelectedId(invoice.id);
                      }}
                      aria-expanded={open}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {invoice.number ?? invoice.reference ?? `Invoice ${invoice.id}`}
                        </span>
                        <span className="block text-xs text-muted-foreground capitalize">
                          {statusLabel(invoice.status ?? invoice.statusCode ?? '')}
                          {invoice.dueDate ? ` · due ${formatDate(invoice.dueDate)}` : ''}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatMoneyMinor(
                          outstandingOf(invoice) || invoice.totalMinor || 0,
                          invoice.currency,
                        )}
                      </span>
                      <ChevronDown
                        className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <div className="border-t border-border px-4 py-3">
                        <ul className="space-y-1 text-sm">
                          {(invoice.lines ?? []).map((line, index) => (
                            <li key={line.id ?? index} className="flex justify-between gap-3">
                              <span className="text-muted-foreground">
                                {line.description ?? 'Line'}
                              </span>
                              <span className="tabular-nums">
                                {formatMoneyMinor(line.amountMinor ?? 0, invoice.currency)}
                              </span>
                            </li>
                          ))}
                          {(invoice.lines ?? []).length === 0 ? (
                            <li className="text-muted-foreground">No line items.</li>
                          ) : null}
                        </ul>
                        {payableRow ? (
                          <Button
                            type="button"
                            size="sm"
                            className="mt-3"
                            disabled={checkout.isPending}
                            onClick={() => {
                              setSelectedId(invoice.id);
                              idempotencyRef.current = newIdempotencyKey();
                              void pay(invoice);
                            }}
                          >
                            Pay this invoice
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })
            )}
          </ul>
        ) : (
          <QueryState
            isPending={receiptsQuery.isPending}
            error={receiptsQuery.error}
            onRetry={() => void receiptsQuery.refetch()}
            isEmpty={receipts.length === 0}
            empty={
              <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No receipts yet. Paid invoices will show here.
              </p>
            }
          >
            <ul className="grid gap-2">
              {receipts.map((receipt) => (
                <li
                  key={receipt.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Receipt className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{receipt.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(receipt.issuedAt)} ·{' '}
                        {formatMoneyMinor(receipt.amountMinor, receipt.currency)}
                      </p>
                    </div>
                  </div>
                  {receipt.documentId != null ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void fetchFileDownloadUrl(receipt.documentId!)
                          .then(({ url }) => {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = '';
                            a.rel = 'noopener';
                            a.click();
                          })
                          .catch((error) =>
                            toastError(
                              'Could not download',
                              error instanceof Error ? error.message : 'Try again.',
                            ),
                          )
                      }
                    >
                      <Download className="size-4" aria-hidden />
                      Download
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </QueryState>
        )}
      </QueryState>
    </div>
  );
}
