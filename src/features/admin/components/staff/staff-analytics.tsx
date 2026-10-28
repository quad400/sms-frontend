'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { STAFF_UI_MOCK } from './ui-mock';

export function StaffAnalytics() {
  const { distribution, retentionRate, workload } = STAFF_UI_MOCK;
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const ring = 2 * Math.PI * 36;
  const filled = (workload.utilisationPct / 100) * ring;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base font-semibold">
              Departmental Distribution & Headcount
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Faculty strength across 8 core administrative and teaching units.
            </p>
          </div>
          <Link
            href="/admin/allocations"
            className="shrink-0 text-xs font-semibold text-teal-700 hover:underline"
          >
            View Full Matrix →
          </Link>
        </div>

        <ul className="space-y-3">
          {distribution.map((d) => (
            <li key={d.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {d.count} Faculty ({d.pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn('block h-full rounded-full', d.barClass)}
                  style={{ width: `${(d.count / maxCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px]">
          <p className="font-semibold uppercase tracking-wide text-muted-foreground">
            Annual staffing retention rate:{' '}
            <span className="text-foreground">{retentionRate}%</span>
          </p>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
            All ministerial allocations balanced
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative mx-auto size-28 shrink-0 sm:mx-0">
            <svg viewBox="0 0 96 96" className="size-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                fill="none"
                className="stroke-muted"
                strokeWidth="10"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                fill="none"
                className="stroke-teal-700"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-heading text-xl font-semibold tabular-nums">
                {workload.utilisationPct}%
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Target {workload.targetPct}%
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="font-heading text-base font-semibold">Healthy Load Balance</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Average {workload.avgPeriods} periods/week against a max cap of{' '}
                {workload.maxCap} periods.
              </p>
            </div>
            <ul className="space-y-1.5 text-sm">
              <li className="flex justify-between gap-2">
                <span className="text-danger">Faculty Over Capacity (&gt;{workload.maxCap} per.)</span>
                <span className="font-semibold tabular-nums">{workload.overCapacity} Staff</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-emerald-700">Optimal Range (16–20 per.)</span>
                <span className="font-semibold tabular-nums">{workload.optimal} Faculty</span>
              </li>
              <li className="flex justify-between gap-2 text-muted-foreground">
                <span>Specialized / Lower Load</span>
                <span className="font-semibold tabular-nums">{workload.specialized} Adjunct</span>
              </li>
            </ul>
            <Button
              type="button"
              variant="outline"
              className="w-full border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
              asChild
            >
              <Link href="/admin/timetables">
                <CalendarDays className="size-4" />
                Rebalance Period Allocations
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
