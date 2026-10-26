'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Clock3, MapPin, UserRound } from 'lucide-react';
import type { TimetableSlot } from '../../lib/schedule';
import {
  isCurrentSlot,
  isUpcomingSlot,
  minutesOf,
  nowMinutes,
  timeRange,
} from '../../lib/schedule';
import { cn } from '@/lib/utils/cn';

function periodProgress(slot: TimetableSlot, now: Date): { pct: number; minsLeft: number } | null {
  const start = minutesOf(slot.startTime);
  const end = minutesOf(slot.endTime);
  if (start === null || end === null || end <= start) return null;
  const current = nowMinutes(now);
  const elapsed = Math.min(Math.max(current - start, 0), end - start);
  const remaining = Math.max(end - current, 0);
  return { pct: Math.round((elapsed / (end - start)) * 100), minsLeft: remaining };
}

function statusFor(slot: TimetableSlot, now: Date): 'attended' | 'ongoing' | 'upcoming' {
  if (isCurrentSlot(slot, now)) return 'ongoing';
  if (isUpcomingSlot(slot, now)) return 'upcoming';
  return 'attended';
}

export function HomeTimetablePanel({
  classLabel,
  roomHint,
  termHint,
  slots,
  now,
}: {
  classLabel: string;
  roomHint: string;
  termHint: string;
  slots: TimetableSlot[];
  now: Date;
}) {
  const daySlots = slots;
  const current = daySlots.find((slot) => isCurrentSlot(slot, now)) ?? null;
  const upcoming = daySlots.find((slot) => isUpcomingSlot(slot, now)) ?? null;
  const hero = current ?? upcoming;
  const progress = hero && current ? periodProgress(hero, now) : null;
  const meta = [classLabel && `Stream ${classLabel}`, roomHint, termHint]
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Daily Academic Timetable
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta || 'Today’s periods'}</p>
        </div>
        <Link
          href="/student/timetable"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-academic transition-colors hover:bg-academic/10"
        >
          Full week <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      <div className="p-4 md:p-5">
        {hero ? (
          <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,130,103,0.35),transparent_55%)]"
            />
            <div className="relative space-y-4 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {current ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-academic px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-academic-foreground">
                      <span className="size-1.5 animate-pulse rounded-full bg-academic-foreground" />
                      In progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider">
                      <Clock3 className="size-3" aria-hidden />
                      Up next
                    </span>
                  )}
                  {hero.periodLabel ? (
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-primary-foreground/55">
                      {hero.periodLabel}
                    </span>
                  ) : null}
                </div>
                {progress ? (
                  <p className="font-mono text-xs font-semibold tabular-nums text-academic">
                    {progress.minsLeft}m left
                  </p>
                ) : hero.startTime ? (
                  <p className="font-mono text-xs font-semibold tabular-nums text-primary-foreground/65">
                    Starts {hero.startTime}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="font-heading text-xl font-semibold leading-snug md:text-2xl">
                  {hero.subjectName}
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-primary-foreground/75">
                  {hero.teacherName ? (
                    <li className="inline-flex items-center gap-1.5">
                      <UserRound className="size-3.5 opacity-60" aria-hidden />
                      {hero.teacherName}
                    </li>
                  ) : null}
                  {hero.roomName ? (
                    <li className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 opacity-60" aria-hidden />
                      {hero.roomName}
                    </li>
                  ) : null}
                  <li className="font-mono tabular-nums">{timeRange(hero)}</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/student/lessons"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-academic px-4 text-sm font-semibold text-academic-foreground transition-opacity hover:opacity-90"
                >
                  <BookOpen className="size-4" aria-hidden />
                  Open Notes
                </Link>
              </div>

              {progress ? (
                <div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-academic transition-[width] duration-500"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-primary-foreground/45">
                    {progress.pct}% elapsed
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/25 px-4 py-10 text-center">
            <p className="font-heading text-lg font-semibold">No more lessons today</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              That’s the full day — check the week view for what’s coming up.
            </p>
            <Link
              href="/student/timetable"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-academic hover:underline"
            >
              Open timetable <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}

        {daySlots.length > 0 ? (
          <ol className="mt-5">
            {daySlots.map((slot, index) => {
              const status = statusFor(slot, now);
              const isLast = index === daySlots.length - 1;
              return (
                <li key={slot.key} className="relative flex gap-3">
                  <div className="flex w-5 shrink-0 flex-col items-center">
                    <span
                      className={cn(
                        'mt-3.5 size-2.5 shrink-0 rounded-full',
                        status === 'ongoing' &&
                          'bg-academic ring-4 ring-academic/20',
                        status === 'attended' && 'bg-academic/50',
                        status === 'upcoming' && 'bg-muted-foreground/30',
                      )}
                    />
                    {!isLast ? (
                      <span
                        aria-hidden
                        className={cn(
                          'mt-1 w-px flex-1',
                          status === 'attended' ? 'bg-academic/25' : 'bg-border',
                        )}
                      />
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      'mb-2 min-w-0 flex-1 rounded-xl px-3 py-2.5 last:mb-0',
                      status === 'ongoing' && 'bg-academic/8 ring-1 ring-academic/20',
                      status === 'upcoming' && 'bg-muted/40',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
                        {slot.startTime || '—'}
                        {slot.endTime ? (
                          <span className="font-normal opacity-70">–{slot.endTime}</span>
                        ) : null}
                      </p>
                      <StatusBadge status={status} />
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-snug">{slot.subjectName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[slot.teacherName, slot.roomName].filter(Boolean).join(' · ') || '—'}
                    </p>
                    {status === 'ongoing' ? (
                      <Link
                        href="/student/lessons"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-academic hover:underline"
                      >
                        Live Desk <ArrowRight className="size-3" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: 'attended' | 'ongoing' | 'upcoming' }) {
  if (status === 'attended') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-academic/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-academic">
        <span aria-hidden>✓</span> Attended
      </span>
    );
  }
  if (status === 'ongoing') {
    return (
      <span className="rounded-md bg-academic px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-academic-foreground">
        Ongoing
      </span>
    );
  }
  return (
    <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border">
      Upcoming
    </span>
  );
}
