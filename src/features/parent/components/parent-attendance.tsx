'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useChildAttendance } from '../hooks/use-child-data';
import { childName, formatDate } from '../lib/format';
import { QueryState } from '../lib/shared';
import type { ParentChild } from '../types';

type StatusKey = 'present' | 'late' | 'excused' | 'absent';

const STATUS: Record<StatusKey, { label: string; icon: LucideIcon; tone: string }> = {
  present: { label: 'Present', icon: CircleCheck, tone: 'bg-academic/12 text-academic' },
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
  const code = String(value ?? '')
    .trim()
    .toLowerCase();
  if (code.startsWith('present')) return 'present';
  if (code.startsWith('late') || code === 'tardy') return 'late';
  if (code.startsWith('excus')) return 'excused';
  if (code.startsWith('absent')) return 'absent';
  return null;
}

function pad(day: number): string {
  return String(day).padStart(2, '0');
}

export function ParentAttendance({
  studentId,
  child,
}: {
  studentId: number;
  child: ParentChild | null;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const from = `${cursor.year}-${pad(cursor.month + 1)}-01`;
  const to = `${cursor.year}-${pad(cursor.month + 1)}-${pad(days)}`;
  const query = useChildAttendance(studentId, from, to);

  const entries = useMemo(() => query.data ?? [], [query.data]);
  const byDate = useMemo(() => {
    const map = new Map<string, StatusKey>();
    for (const entry of entries) {
      const key = (entry.date ?? '').slice(0, 10);
      const status = normaliseStatus(entry.status ?? entry.mark);
      if (key && status) map.set(key, status);
    }
    return map;
  }, [entries]);

  const counts = useMemo(() => {
    const out: Record<StatusKey, number> = { present: 0, late: 0, excused: 0, absent: 0 };
    for (const status of byDate.values()) out[status] += 1;
    return out;
  }, [byDate]);

  const markedDays = STATUS_ORDER.reduce((sum, key) => sum + counts[key], 0);
  const rate = markedDays > 0 ? Math.round((counts.present / markedDays) * 100) : null;
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
  const leading = (new Date(cursor.year, cursor.month, 1).getDay() + 6) % 7;
  const isCurrentMonth = cursor.year === now.getFullYear() && cursor.month === now.getMonth();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description={child ? `Marks for ${childName(child)}.` : 'Monthly attendance calendar.'}
      />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          onClick={() =>
            setCursor((prev) => {
              const next = new Date(prev.year, prev.month - 1, 1);
              return { year: next.getFullYear(), month: next.getMonth() };
            })
          }
        >
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
          onClick={() =>
            setCursor((prev) => {
              const next = new Date(prev.year, prev.month + 1, 1);
              return { year: next.getFullYear(), month: next.getMonth() };
            })
          }
        >
          <ChevronRight />
        </Button>
      </div>

      <QueryState isPending={query.isPending} error={query.error} onRetry={() => void query.refetch()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_ORDER.map((key) => {
            const { label, icon: Icon, tone } = STATUS[key];
            return (
              <div key={key} className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
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
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rate
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
              {rate === null ? '—' : `${rate}%`}
            </p>
          </div>
        </div>

        <section
          aria-label="Attendance calendar"
          className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] md:p-5"
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_HEADERS.map((day) => (
              <p
                key={day}
                className="pb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </p>
            ))}
            {Array.from({ length: leading }, (_, i) => (
              <div key={`pad-${i}`} aria-hidden />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const key = `${from.slice(0, 8)}${pad(day)}`;
              const status = byDate.get(key);
              const meta = status ? STATUS[status] : null;
              const Icon = meta?.icon;
              return (
                <div
                  key={key}
                  title={meta ? `${formatDate(key)} · ${meta.label}` : formatDate(key)}
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
              {[...entries]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((entry, index) => {
                  const status = normaliseStatus(entry.status ?? entry.mark);
                  const meta = status ? STATUS[status] : null;
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
                      {meta ? (
                        <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold', meta.tone)}>
                          {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
                          {meta.label}
                        </span>
                      ) : null}
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
