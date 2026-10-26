'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Clock3 } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { buttonVariants } from '@/components/ui/button';
import { useActiveChild } from '../hooks/use-active-child';
import { useChildInvoices, useChildReceipts } from '../hooks/use-child-data';
import { childPath } from '@/components/shells/parent-nav';
import { formatMoneyMinor } from '@/lib/money/format';

type Phase = 'polling' | 'paid' | 'pending' | 'missing';

const POLL_MS = 2_000;
const MAX_MS = 60_000;

export function ParentPaymentReturn() {
  const search = useSearchParams();
  const reference = search.get('reference') ?? '';
  const { activeChildId, childHref } = useActiveChild();
  const invoices = useChildInvoices(activeChildId);
  const receipts = useChildReceipts(activeChildId);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!activeChildId || !reference) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const next = Date.now() - started;
      setElapsed(next);
      void invoices.refetch();
      void receipts.refetch();
      if (next >= MAX_MS) window.clearInterval(timer);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeChildId, reference]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchedReceipt = useMemo(() => {
    if (!reference) return null;
    return (receipts.data ?? []).find(
      (row) =>
        row.receiptNumber === reference ||
        String(row.paymentId) === reference ||
        String(row.id) === reference,
    );
  }, [receipts.data, reference]);

  const paidInvoice = useMemo(() => {
    return (invoices.data?.invoices ?? []).find((invoice) => {
      const status = (invoice.status ?? invoice.statusCode ?? '').toLowerCase();
      return status === 'paid' && (invoice.reference === reference || String(invoice.id) === reference);
    });
  }, [invoices.data, reference]);

  let phase: Phase = 'polling';
  if (!reference) phase = 'missing';
  else if (matchedReceipt || paidInvoice) phase = 'paid';
  else if (elapsed >= MAX_MS) phase = 'pending';

  const feesHref = activeChildId ? childPath(activeChildId, '/fees') : '/parent';

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <PageHeader title="Payment" description="Confirming your checkout with the school." />

      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
        {phase === 'missing' ? (
          <>
            <Clock3 className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <h2 className="mt-3 font-heading text-lg font-semibold">Missing payment reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Return to fees and try again from the Pay now button.
            </p>
          </>
        ) : null}

        {phase === 'polling' ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-academic" aria-hidden />
            <h2 className="mt-3 font-heading text-lg font-semibold">Confirming payment…</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please wait while we check with the school. This can take up to a minute.
            </p>
          </>
        ) : null}

        {phase === 'paid' ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden />
            <h2 className="mt-3 font-heading text-lg font-semibold">Payment received</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {matchedReceipt
                ? `Receipt ${matchedReceipt.receiptNumber} · ${formatMoneyMinor(matchedReceipt.amountMinor, matchedReceipt.currency)}`
                : 'Your invoice is marked paid.'}
            </p>
          </>
        ) : null}

        {phase === 'pending' ? (
          <>
            <Clock3 className="mx-auto size-10 text-amber-600" aria-hidden />
            <h2 className="mt-3 font-heading text-lg font-semibold">We are confirming your payment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The gateway returned, but the school has not marked the invoice paid yet. Your receipt
              will appear under Fees when confirmation finishes — we never treat the redirect alone
              as success.
            </p>
          </>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={feesHref} className={buttonVariants()}>
            Back to fees
          </Link>
          <Link href={childHref('/results')} className={buttonVariants({ variant: 'outline' })}>
            View results
          </Link>
        </div>
      </div>
    </div>
  );
}
