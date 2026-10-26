'use client';

import { PageHeader } from '@/components/patterns/page-header';
import { usePortalLibrary } from '../hooks/use-portal-library';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '../lib/format';

export function StudentLibrary() {
  const query = usePortalLibrary();
  const data = asRecord(query.data);
  const summary = asRecord(data?.summary);
  const loans = asArray(data?.loans);
  const catalog = asArray(data?.catalog).slice(0, 6);

  const activeLoans = num(summary?.activeLoans, loans.length);
  const overdueLoans = num(summary?.overdueLoans, 0);
  const activeHolds = num(summary?.activeHolds, 0);
  const nextDue = formatDate(summary?.nextDueDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Track your loans, holds and browse the school catalogue."
      />

      <QueryState isPending={query.isPending} error={query.error} onRetry={() => void query.refetch()}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active loans" value={String(activeLoans)} hint="Books you have borrowed" />
          <StatCard
            label="Overdue"
            value={String(overdueLoans)}
            hint={overdueLoans > 0 ? 'Please return these soon' : 'Nothing overdue'}
          />
          <StatCard label="Active holds" value={String(activeHolds)} hint="Reserved for you" />
          <StatCard label="Next due" value={nextDue || '—'} hint="Earliest return date" />
        </div>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6">
          <h2 className="font-heading text-lg font-semibold">Currently borrowed</h2>
          {loans.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No active loans.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {loans.map((row, index) => {
                const loan = asRecord(row);
                return (
                  <li
                    key={str(loan?.id, String(index))}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{str(loan?.title, 'Title')}</p>
                      <p className="text-sm text-muted-foreground">
                        {str(loan?.author)}
                        {str(loan?.author) && str(loan?.accessionBarcode) ? ' · ' : ''}
                        <span className="font-mono text-xs">{str(loan?.accessionBarcode)}</span>
                      </p>
                    </div>
                    <DuePill dueDate={str(loan?.dueDate)} overdue={loan?.isOverdue === true} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {catalog.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">Browse the catalogue</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((row, index) => {
                const book = asRecord(row);
                const copies = num(book?.availableCopies, 0);
                return (
                  <article
                    key={str(book?.bookId, String(index))}
                    className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <p className="font-medium">{str(book?.title, 'Title')}</p>
                    <p className="text-sm text-muted-foreground">{str(book?.author)}</p>
                    <p
                      className={cn(
                        'mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider',
                        copies > 0 ? 'text-academic' : 'text-muted-foreground',
                      )}
                    >
                      {copies > 0 ? `${copies} cop${copies === 1 ? 'y' : 'ies'} available` : 'All copies out'}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </QueryState>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function DuePill({ dueDate, overdue }: { dueDate: string; overdue: boolean }) {
  const label = formatDate(dueDate);
  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide',
        overdue
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'
          : 'bg-academic/10 text-academic',
      )}
    >
      {overdue ? 'Overdue · ' : 'Due '}
      {label || 'date TBD'}
    </span>
  );
}
