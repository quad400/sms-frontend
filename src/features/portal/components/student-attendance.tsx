'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePortalAttendance } from '../hooks/use-portal-attendance';
import { QueryState } from './query-state';
import { str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { formatDate, listFrom } from '../lib/format';

type StatusKey = 'present' | 'late' | 'excused' | 'absent';

const STATUS: Record<StatusKey, { label: string; icon: LucideIcon; tone: string }> = {
  present: {
    label: 'Present',
    icon: CircleCheck,
    tone: 'bg-academic/12 text-academic',
  },
  late: {
    label: 'Late',
    icon: Clock,
    tone: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  },
  excused: {
    label: 'Excused',
    icon: ShieldCheck,
    tone: 'bg-blue-50 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
  },
  absent: {
    label: 'Absent',
    icon: CircleX,
    tone: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
  },
};

const STATUS_ORDER: StatusKey[] = ['present', 'late', 'excused', 'absent'];
const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function normaliseStatus(value: unknown): StatusKey | null {
  const code = str(value).trim().toLowerCase();
  if (code.startsWith('present')) return 'present';
  if (code.startsWith('late') || code === 'tardy') return 'late';
  if (code.startsWith('excus')) return 'excused';
  if (code.startsWith('absent')) return 'absent';
  return null;
}

const pad = (value: number): string => String(value).padStart(2, '0');

function monthBounds(year: number, month: number): { from: string; to: string; days: number } {
  const days = new Date(year, month + 1, 0).getDate();
  const prefix = `${year}-${pad(month + 1)}`;
  return { from: `${prefix}-01`, to: `${prefix}-${pad(days)}`, days };
}

type Entry = { date: string; status: StatusKey | null; raw: string; note: string };

export function StudentAttendance() {
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const { from, to, days } = monthBounds(cursor.year, cursor.month);
  const query = usePortalAttendance({ from, to });

  const todayDate = new Date();
  const isCurrentMonth =
    cursor.year === todayDate.getFullYear() && cursor.month === todayDate.getMonth();

  const entries = useMemo<Entry[]>(() => {
    return listFrom(query.data, 'entries', 'items', 'records')
      .map((row) => {
        const raw = str(row.statusCode ?? row.status ?? row.mark);
        return {
          date: str(row.date ?? row.markedAt ?? row.createdAt).slice(0, 10),
          status: normaliseStatus(raw),
          raw,
          note: str(row.note ?? row.remark ?? row.reason),
        };
      })
      .filter((entry) => entry.date >= from && entry.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [query.data, from, to]);

  const byDate = useMemo(() => {
    const map = new Map<string, Entry>();
    for (const entry of entries) map.set(entry.date, entry);
    return map;
  }, [entries]);

  const counts = useMemo(() => {
    const result: Record<StatusKey, number> = { present: 0, late: 0, excused: 0, absent: 0 };
    for (const entry of entries) if (entry.status) result[entry.status] += 1;
    return result;
  }, [entries]);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  // Monday-first offset for the 1st of the month.
  const leading = (new Date(cursor.year, cursor.month, 1).getDay() + 6) % 7;

  function shift(delta: number): void {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" description="Your attendance marks, month by month." />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
        <Button type="button" variant="ghost" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
          <ChevronLeft />
        </Button>
        <p className="font-heading text-lg font-semibold" aria-live="polite">
          {monthLabel}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next month"
          disabled={isCurrentMonth}
          onClick={() => shift(1)}
        >
          <ChevronRight />
        </Button>
      </div>

      <QueryState isPending={query.isPending} error={query.error} onRetry={() => void query.refetch()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATUS_ORDER.map((key) => {
            const { label, icon: Icon, tone } = STATUS[key];
            return (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
              >
                <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1', tone)}>
                  <Icon className="size-3.5" aria-hidden />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                  </span>
                </span>
                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{counts[key]}</p>
              </div>
            );
          })}
        </div>

        <section
          aria-label="Attendance calendar"
          className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] md:p-5"
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_HEADERS.map((day) => (
              <p key={day} className="pb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </p>
            ))}
            {Array.from({ length: leading }, (_, i) => (
              <div key={`pad-${i}`} aria-hidden />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const key = `${from.slice(0, 8)}${pad(day)}`;
              const entry = byDate.get(key);
              const meta = entry?.status ? STATUS[entry.status] : null;
              const Icon = meta?.icon;
              return (
                <div
                  key={key}
                  title={meta ? `${formatDate(key)} · ${meta.label}` : formatDate(key)}
                  aria-label={meta ? `${formatDate(key)}: ${meta.label}` : undefined}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-xs',
                    meta ? meta.tone : 'bg-muted/40 text-muted-foreground',
                  )}
                >
                  <span className="font-mono font-semibold tabular-nums">{day}</span>
                  {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label="Marks this month" className="space-y-2">
          <h2 className="font-heading text-lg font-semibold">This month</h2>
          {entries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No attendance marks for {monthLabel}.
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry, index) => {
                const meta = entry.status ? STATUS[entry.status] : null;
                const Icon = meta?.icon;
                return (
                  <li
                    key={`${entry.date}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm tabular-nums">
                        {formatDate(entry.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      {entry.note ? (
                        <p className="truncate text-xs text-muted-foreground">{entry.note}</p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1',
                        meta ? meta.tone : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
                        {meta ? meta.label : entry.raw || 'Marked'}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </QueryState>
    </div>
  );
}
