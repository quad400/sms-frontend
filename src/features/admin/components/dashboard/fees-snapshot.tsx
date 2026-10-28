'use client';

import { MoneyText } from '@/components/patterns/money';
import { SectionCard } from '@/components/patterns/section-card';
import { cn } from '@/lib/utils/cn';

const actionClass = 'text-[11px] font-semibold uppercase tracking-wide no-underline hover:underline';

export function FeesSnapshot({
  collectedMinor,
  outstandingMinor,
  targetMinor,
  paidFraction,
  aging,
  showCollected,
  showOutstanding,
  description,
}: {
  collectedMinor: number | null;
  outstandingMinor: number | null;
  targetMinor: number | null;
  paidFraction: number | null;
  aging: Array<{ id: string; label: string; minor: number; overdue?: boolean }>;
  showCollected: boolean;
  showOutstanding: boolean;
  description?: string;
}) {
  return (
    <SectionCard
      title="Fees snapshot"
      description={description ?? 'Current fiscal term reconciliation status'}
      action={{ label: 'Fee ledger →', href: '/admin/fees/payments' }}
      actionClassName={actionClass}
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        {showCollected ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Collected
            </dt>
            <dd className="mt-1">
              <MoneyText
                minor={collectedMinor}
                className="text-lg font-semibold text-emerald-700"
              />
            </dd>
            {paidFraction != null ? (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    Term target
                    {targetMinor != null ? (
                      <>
                        : <MoneyText minor={targetMinor} className="text-[11px]" />
                      </>
                    ) : null}
                  </span>
                  <span className="tabular-nums text-emerald-700">
                    {Math.round(paidFraction * 100)}% paid
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500/80"
                    style={{ width: `${Math.min(100, Math.max(0, paidFraction * 100))}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        {showOutstanding ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Outstanding
            </dt>
            <dd className="mt-1">
              <MoneyText
                minor={outstandingMinor}
                className="text-lg font-semibold text-amber-700"
              />
            </dd>
            {aging.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {aging.map((b) => (
                  <span
                    key={b.id}
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] tabular-nums',
                      b.overdue
                        ? 'bg-amber-900 text-amber-50'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {b.label}: <MoneyText minor={b.minor} className="text-[11px]" />
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </dl>
    </SectionCard>
  );
}
