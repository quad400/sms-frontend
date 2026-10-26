'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, Clock3 } from 'lucide-react';
import { formatDate } from '../../lib/format';
import { str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';

function deadlineParts(value: unknown): { day: string; month: string; label: string } {
  const label =
    formatDate(value, { weekday: 'short', day: 'numeric', month: 'short' }) || 'Date TBD';
  const raw = str(value);
  if (!raw) return { day: '—', month: '', label };
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const date = new Date(dateOnly ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(date.getTime())) return { day: '—', month: '', label };
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    label,
  };
}

export function HomeRightRail({
  deadlines,
}: {
  deadlines: Record<string, unknown>[];
}) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border/70 px-4 py-4 md:px-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-academic">
                <CalendarClock className="size-4" aria-hidden />
              </span>
              <h2 className="font-heading text-base font-semibold tracking-tight">Priority Deadlines</h2>
            </div>
            {deadlines.length > 0 ? (
              <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-academic">
                {deadlines.length}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Upcoming school events and milestones.</p>
        </div>

        <div className="p-4 md:p-5">
          {deadlines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-6 text-center">
              <p className="text-sm font-medium text-foreground">No deadlines yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Events will show up here when scheduled.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border">
              {deadlines.map((item, index) => {
                const key =
                  typeof item.id === 'string' || typeof item.id === 'number'
                    ? String(item.id)
                    : String(index);
                const when = deadlineParts(item.startsAt ?? item.startAt ?? item.date);
                return (
                  <li key={key}>
                    <Link
                      href="/student/events"
                      className={cn(
                        'group flex items-center gap-3 bg-background px-3 py-3 transition-colors',
                        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      )}
                    >
                      <time
                        dateTime={str(item.startsAt ?? item.startAt ?? item.date) || undefined}
                        className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-soft text-academic ring-1 ring-amber-100"
                      >
                        <span className="font-mono text-[10px] font-semibold leading-none tracking-wide">
                          {when.month || '—'}
                        </span>
                        <span className="mt-0.5 font-mono text-base font-bold leading-none tabular-nums">
                          {when.day}
                        </span>
                      </time>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-snug">
                          {str(item.title, 'Event')}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          {when.label}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all group-hover:bg-academic/10 group-hover:text-academic"
                      >
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/student/events"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            View all events <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </aside>
  );
}
