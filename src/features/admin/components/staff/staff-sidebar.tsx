'use client';

import Link from 'next/link';
import { IdCard } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { STAFF_UI_MOCK } from './ui-mock';

export function StaffSidebar() {
  const { distribution, retentionRate, workload } = STAFF_UI_MOCK;
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      {/* <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Department Headcount
            </h2>
            <p className="text-xs text-muted-foreground">Faculty strength by unit</p>
          </div>
        </div>
        <ul className="space-y-3">
          {distribution.map((row) => {
            const pct = Math.round((row.count / maxCount) * 100);
            return (
              <li key={row.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-foreground">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-xs font-semibold text-muted-foreground">
                    {row.count}
                    <span className="ml-1">({row.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', row.barClass)}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Retention{' '}
          <span className="font-semibold text-foreground">{retentionRate}%</span>
        </p>
        <Link
          href="/admin/allocations"
          className="mt-2 inline-block text-xs font-semibold text-teal-700 hover:underline"
        >
          View Full Matrix →
        </Link>
      </section> */}

      {/* <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-base font-semibold tracking-tight">Load Balance</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Avg {workload.avgPeriods} periods / week · cap {workload.maxCap}
        </p>
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-foreground">Utilisation</span>
            <span className="tabular-nums text-xs font-semibold text-muted-foreground">
              {workload.utilisationPct}% / {workload.targetPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full',
                workload.utilisationPct > workload.targetPct ? 'bg-amber-500' : 'bg-teal-600',
              )}
              style={{ width: `${Math.min(100, workload.utilisationPct)}%` }}
            />
          </div>
        </div>
        <ul className="space-y-1.5 text-xs">
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Optimal range</span>
            <span className="font-semibold tabular-nums">{workload.optimal}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Over capacity</span>
            <span className="font-semibold tabular-nums">{workload.overCapacity}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-muted-foreground">Specialized / lower</span>
            <span className="font-semibold tabular-nums">{workload.specialized}</span>
          </li>
        </ul>
        <Link
          href="/admin/timetables"
          className="mt-3 inline-block text-xs font-semibold text-teal-700 hover:underline"
        >
          Rebalance Allocations →
        </Link>
      </section> */}

      {/* <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
      >
        <IdCard className="size-4" />
        Generate Staff ID Cards
      </button> */}
    </aside>
  );
}
