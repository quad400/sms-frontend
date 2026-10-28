'use client';

import Link from 'next/link';
import { IdCard } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { STUDENTS_UI_MOCK } from './ui-mock';

export function StudentsSidebar() {
  const { capacity, houses } = STUDENTS_UI_MOCK;

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-semibold tracking-tight">Class Capacity</h2>
            <p className="text-xs text-muted-foreground">Enrolment vs seat caps by level</p>
          </div>
        </div>
        <ul className="space-y-3">
          {capacity.map((row) => {
            const pct = Math.round((row.enrolled / row.capacity) * 100);
            const over = row.enrolled > row.capacity;
            return (
              <li key={row.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-foreground">
                    {row.label}
                    <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">
                      {row.arms} arms
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 tabular-nums text-xs font-semibold',
                      over ? 'text-amber-700' : 'text-muted-foreground',
                    )}
                  >
                    {row.enrolled} / {row.capacity}
                    <span className="ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', over ? 'bg-amber-500' : 'bg-teal-600')}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <Link
          href="/admin/classes"
          className="mt-4 inline-block text-xs font-semibold text-teal-700 hover:underline"
        >
          Manage Arms & Cohorts →
        </Link>
      </section>

      {/* <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-base font-semibold tracking-tight">Houses Distribution</h2>
        <p className="mb-3 text-xs text-muted-foreground">Current house membership</p>
        <div className="grid grid-cols-2 gap-2">
          {houses.map((h) => (
            <div
              key={h.id}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-3"
            >
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: h.colour }}
                aria-hidden
              />
              <p className="pl-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {h.name}
              </p>
              <p className="pl-2.5 font-heading text-xl font-semibold tabular-nums">{h.count}</p>
              <p className="pl-2.5 text-[11px] text-muted-foreground">{h.placeLabel}</p>
            </div>
          ))}
        </div>
      </section> */}

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
      >
        <IdCard className="size-4" />
        Generate Student ID Cards
      </button>
    </aside>
  );
}
