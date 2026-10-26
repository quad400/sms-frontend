'use client';

import Link from 'next/link';
import { ClipboardCheck, Coffee, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { formatTime, minutesOf, timeRange } from '../../lib/format';
import type { StaffOverview } from '../../types';
import { EmptyPanel, Panel } from '../shared/panel';

type PeriodState = 'now' | 'next' | 'done' | 'later';

function stateFor(startTime: string, endTime: string, nowMinutes: number | null, nextStart: number | null): PeriodState {
  const start = minutesOf(startTime);
  const end = minutesOf(endTime);
  if (nowMinutes === null || start === null || end === null) return 'later';
  if (nowMinutes >= end) return 'done';
  if (nowMinutes >= start) return 'now';
  return nextStart === start ? 'next' : 'later';
}

export function TodayLessons({
  overview,
  nowMinutes,
  canOpenRegister,
}: {
  overview: StaffOverview;
  nowMinutes: number | null;
  canOpenRegister: boolean;
}) {
  const periods = overview.timetable;
  const nextStart =
    nowMinutes === null
      ? null
      : (periods
          .map((period) => minutesOf(period.startTime))
          .filter((minutes): minutes is number => minutes !== null && minutes > nowMinutes)
          .sort((a, b) => a - b)[0] ?? null);

  return (
    <Panel title="My lessons today" description={`${periods.length} ${periods.length === 1 ? 'period' : 'periods'} scheduled`}>
      {periods.length === 0 ? (
        <EmptyPanel
          title="No lessons today"
          description="Nothing is timetabled for you today. Check your weekly timetable for the full week."
          icon={Coffee}
          action={
            <Link href="/staff/timetable" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              View timetable
            </Link>
          }
        />
      ) : (
        <ol className="space-y-2">
          {periods.map((period) => {
            const state = stateFor(period.startTime, period.endTime, nowMinutes, nextStart);
            const register = overview.openRegisters.find(
              (row) => row.classId === period.classId && row.date === overview.date,
            );
            return (
              <li
                key={`${period.timeSlotId}-${period.classId}`}
                aria-current={state === 'now' ? 'time' : undefined}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center',
                  state === 'now'
                    ? 'border-academic/50 bg-accent-soft/60'
                    : 'border-border bg-card',
                  state === 'done' && 'opacity-70',
                )}
              >
                <div className="w-28 shrink-0">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatTime(period.startTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">{period.periodLabel}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {period.subjectName ?? `Subject ${period.subjectId}`}
                    <span className="font-normal text-muted-foreground">
                      {' · '}
                      {period.className ?? `Class ${period.classId}`}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeRange(period.startTime, period.endTime)}
                    {period.roomName ? ` · ${period.roomName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {state === 'now' ? <Badge variant="default">Now</Badge> : null}
                  {state === 'next' ? <Badge variant="soft">Next</Badge> : null}
                  {state === 'done' ? <Badge variant="secondary">Done</Badge> : null}
                  {canOpenRegister && !period.isBreak ? (
                    <Link
                      href={
                        register
                          ? `/staff/attendance/${register.id}`
                          : `/staff/attendance?classId=${period.classId}`
                      }
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      {register ? (
                        <DoorOpen aria-hidden />
                      ) : (
                        <ClipboardCheck aria-hidden />
                      )}
                      {register ? 'Open register' : 'Take attendance'}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
