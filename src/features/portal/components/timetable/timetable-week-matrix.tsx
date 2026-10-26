'use client';

import { useMemo } from 'react';
import {
  DAY_LONG,
  DAY_SHORT,
  WEEK_DAYS,
  isCurrentSlot,
  minutesOf,
  type DayCode,
  type TimetableSlot,
} from '../../lib/schedule';
import { cn } from '@/lib/utils/cn';
import { TimetableCalmState } from './timetable-calm-state';
import { TimetableDaily } from './timetable-daily';

type PeriodRow = {
  key: string;
  label: string;
  startTime: string;
  endTime: string;
  order: number;
};

function rowKey(slot: TimetableSlot): string {
  if (slot.periodLabel) return `p:${slot.periodLabel}`;
  if (slot.startTime) return `t:${slot.startTime}-${slot.endTime}`;
  return `o:${slot.order}`;
}

function buildRows(slots: TimetableSlot[]): PeriodRow[] {
  const map = new Map<string, PeriodRow>();
  for (const slot of slots) {
    const key = rowKey(slot);
    const existing = map.get(key);
    const start = minutesOf(slot.startTime) ?? Number.MAX_SAFE_INTEGER;
    const order = existing
      ? Math.min(existing.order, start)
      : start;
    map.set(key, {
      key,
      label: slot.periodLabel || (slot.startTime ? `P · ${slot.startTime}` : `Period`),
      startTime: existing?.startTime || slot.startTime,
      endTime: existing?.endTime || slot.endTime,
      order,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.order - b.order || a.startTime.localeCompare(b.startTime));
}

export function TimetableWeekMatrix({
  byDay,
  slots,
  now,
  today,
  onSelect,
}: {
  byDay: Record<DayCode, TimetableSlot[]>;
  slots: TimetableSlot[];
  now: Date;
  today: DayCode | null;
  onSelect: (slot: TimetableSlot) => void;
}) {
  const rows = useMemo(() => buildRows(slots), [slots]);

  const cellMap = useMemo(() => {
    const map = new Map<string, TimetableSlot>();
    for (const slot of slots) {
      map.set(`${rowKey(slot)}:${slot.day}`, slot);
    }
    return map;
  }, [slots]);

  if (slots.length === 0) {
    return (
      <TimetableCalmState
        title="No timetable yet"
        body="Your timetable will appear here once it is published."
      />
    );
  }

  return (
    <>
      {/* Mobile / small: stacked days */}
      <div className="space-y-6 md:hidden">
        {WEEK_DAYS.map((code) => (
          <section key={code} className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-semibold">{DAY_LONG[code]}</h2>
              {today === code ? (
                <span className="rounded-md bg-academic/10 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-academic">
                  Today
                </span>
              ) : null}
            </div>
            {byDay[code].length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                No lessons.
              </p>
            ) : (
              <TimetableDaily
                slots={byDay[code]}
                now={now}
                emptyTitle="No lessons"
                emptyBody="Nothing is scheduled for this day."
                onSelect={onSelect}
              />
            )}
          </section>
        ))}
      </div>

      {/* md+: matrix */}
      <div className="hidden overflow-x-auto md:block">
        <div
          className="min-w-[720px] rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
          role="table"
          aria-label="Weekly timetable"
        >
          <div
            className="grid border-b border-border bg-muted/40"
            style={{ gridTemplateColumns: `7.5rem repeat(5, minmax(0, 1fr))` }}
            role="row"
          >
            <div className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" role="columnheader">
              Period
            </div>
            {WEEK_DAYS.map((code) => (
              <div
                key={code}
                role="columnheader"
                className={cn(
                  'border-l border-border px-2 py-3 text-center',
                  today === code && 'bg-academic/5',
                )}
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {DAY_SHORT[code]}
                </p>
                {today === code ? (
                  <p className="mt-0.5 font-mono text-[10px] font-semibold text-academic">Today</p>
                ) : null}
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div
              key={row.key}
              className="grid border-b border-border last:border-b-0"
              style={{ gridTemplateColumns: `7.5rem repeat(5, minmax(0, 1fr))` }}
              role="row"
            >
              <div
                className="flex flex-col justify-center gap-0.5 border-r border-border bg-muted/20 px-3 py-3"
                role="rowheader"
              >
                <span className="font-mono text-[11px] font-semibold text-foreground">{row.label}</span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {[row.startTime, row.endTime].filter(Boolean).join(' – ')}
                </span>
              </div>
              {WEEK_DAYS.map((code) => {
                const slot = cellMap.get(`${row.key}:${code}`);
                if (!slot) {
                  return (
                    <div
                      key={code}
                      role="cell"
                      className="min-h-[72px] border-l border-border bg-muted/10"
                    />
                  );
                }
                const current = isCurrentSlot(slot, now);
                return (
                  <div key={code} role="cell" className="border-l border-border p-1.5">
                    <button
                      type="button"
                      onClick={() => onSelect(slot)}
                      aria-current={current ? 'time' : undefined}
                      className={cn(
                        'flex h-full min-h-[64px] w-full flex-col rounded-xl px-2.5 py-2 text-left transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        current
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-sky-50 hover:bg-sky-100/80',
                      )}
                    >
                      {current ? (
                        <span className="mb-1 inline-flex w-fit items-center gap-1 rounded bg-academic px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-academic-foreground">
                          Live
                        </span>
                      ) : null}
                      <p className="line-clamp-2 text-xs font-semibold leading-snug">
                        {slot.subjectName}
                      </p>
                      <p
                        className={cn(
                          'mt-auto pt-1 truncate font-mono text-[10px]',
                          current ? 'text-primary-foreground/65' : 'text-muted-foreground',
                        )}
                      >
                        {slot.roomName || slot.teacherName || '—'}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
