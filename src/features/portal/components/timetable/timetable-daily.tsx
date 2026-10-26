'use client';

import { minutesOf, isCurrentSlot, timeRange, type TimetableSlot } from '../../lib/schedule';
import { cn } from '@/lib/utils/cn';
import { TimetableCalmState } from './timetable-calm-state';

const GAP_MINUTES = 15;

function gapMinutes(prev: TimetableSlot, next: TimetableSlot): number | null {
  const end = minutesOf(prev.endTime);
  const start = minutesOf(next.startTime);
  if (end === null || start === null) return null;
  return start - end;
}

export function TimetableDaily({
  slots,
  now,
  emptyTitle,
  emptyBody,
  onSelect,
}: {
  slots: TimetableSlot[];
  now: Date;
  emptyTitle: string;
  emptyBody: string;
  onSelect: (slot: TimetableSlot) => void;
}) {
  if (slots.length === 0) {
    return <TimetableCalmState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <ol className="space-y-2">
      {slots.map((slot, index) => {
        const current = isCurrentSlot(slot, now);
        const prev = slots[index - 1];
        const gap = prev ? gapMinutes(prev, slot) : null;
        const showGap = gap !== null && gap >= GAP_MINUTES;

        return (
          <li key={slot.key} className="space-y-2">
            {showGap ? (
              <div
                className="flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2 text-violet-800/80"
                aria-hidden
              >
                <span className="font-mono text-[11px] font-semibold tabular-nums">
                  {prev!.endTime} – {slot.startTime}
                </span>
                <span className="h-px flex-1 bg-violet-200/80" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wide">
                  {gap} min break
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onSelect(slot)}
              aria-current={current ? 'time' : undefined}
              className={cn(
                'flex w-full items-stretch gap-3 rounded-2xl border text-left transition-all',
                'hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                current
                  ? 'border-transparent bg-primary p-3.5 text-primary-foreground shadow-[var(--shadow-card)]'
                  : 'border-border bg-sky-50/80 p-3.5 shadow-[var(--shadow-card)] hover:border-academic/40',
              )}
            >
              <div
                className={cn(
                  'flex w-[4.5rem] shrink-0 flex-col justify-center rounded-xl px-2 py-2 font-mono text-xs font-semibold tabular-nums',
                  current ? 'bg-white/10' : 'bg-white/80 text-muted-foreground',
                )}
              >
                <span className={current ? 'text-academic' : 'text-foreground'}>
                  {slot.startTime || '—'}
                </span>
                <span className={current ? 'text-primary-foreground/60' : ''}>
                  {slot.endTime || ''}
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {slot.periodLabel ? (
                    <span
                      className={cn(
                        'font-mono text-[10px] font-semibold uppercase tracking-wider',
                        current ? 'text-primary-foreground/55' : 'text-muted-foreground',
                      )}
                    >
                      {slot.periodLabel}
                    </span>
                  ) : null}
                  {current ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-academic px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-academic-foreground">
                      <span className="size-1.5 animate-pulse rounded-full bg-academic-foreground" />
                      Live now
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-sm font-semibold leading-snug md:text-base">
                  {slot.subjectName}
                </p>
                <p
                  className={cn(
                    'truncate text-xs',
                    current ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {[slot.roomName, slot.teacherName].filter(Boolean).join(' · ') ||
                    timeRange(slot)}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
