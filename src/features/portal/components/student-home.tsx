'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/errors';
import { useSession } from '@/lib/auth/permissions';
import { useFeatureFlags } from '@/lib/config/use-feature-flags';
import { asRecord, str } from '@/lib/utils/record';
import { usePortalAttendance } from '../hooks/use-portal-attendance';
import { usePortalEvents } from '../hooks/use-portal-events';
import { usePortalOverview } from '../hooks/use-portal-overview';
import { usePortalResults } from '../hooks/use-portal-results';
import { usePortalTimetable } from '../hooks/use-portal-timetable';
import {
  WITHHELD_COPY,
  firstName,
  isWithheldRow,
  listFrom,
  toRecords,
} from '../lib/format';
import { dayCodeOf, parseTimetable, useNow } from '../lib/schedule';
import { HomeActionCenter } from './home/home-action-center';
import { HomeHeader, type HomeHorizon } from './home/home-header';
import { HomeKpiStrip, type HomeKpi } from './home/home-kpi-strip';
import { HomeRightRail } from './home/home-right-rail';
import { HomeTimetablePanel } from './home/home-timetable-panel';
import { QueryState } from './query-state';

const pad = (n: number) => String(n).padStart(2, '0');

function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function eventStart(row: Record<string, unknown>): Date | null {
  const raw = str(row.startsAt ?? row.startAt ?? row.date);
  if (!raw) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const date = new Date(dateOnly ? `${raw}T00:00:00` : raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPresentish(row: Record<string, unknown>): boolean {
  const code = str(row.statusCode ?? row.status ?? row.mark).toLowerCase();
  return code.startsWith('present') || code.startsWith('late') || code === 'tardy';
}

function attendanceFromRows(rows: Record<string, unknown>[]): {
  rate: number | null;
  present: number;
  total: number;
} {
  const marked = rows.filter((row) => {
    const code = str(row.statusCode ?? row.status ?? row.mark).trim();
    return code.length > 0;
  });
  if (marked.length === 0) return { rate: null, present: 0, total: 0 };
  const present = marked.filter(isPresentish).length;
  return {
    rate: Math.round((present / marked.length) * 100),
    present,
    total: marked.length,
  };
}

function academicAverage(data: unknown, withheld: boolean): number | null {
  if (withheld) return null;
  const root = asRecord(data);
  if (root && isWithheldRow(root)) return null;

  const direct = root?.average ?? root?.overallAverage ?? root?.mean;
  if (typeof direct === 'number' && Number.isFinite(direct)) {
    return Math.round(direct <= 1 ? direct * 100 : direct);
  }

  const rows = listFrom(data, 'results', 'terms', 'subjects', 'items');
  const scores: number[] = [];
  for (const row of rows) {
    if (isWithheldRow(row)) continue;
    const nested = toRecords(row.subjects ?? row.results);
    const pool = nested.length > 0 ? nested : [row];
    for (const subject of pool) {
      if (isWithheldRow(subject)) continue;
      const raw = subject.totalScore ?? subject.score ?? subject.total ?? subject.average;
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isFinite(n)) scores.push(n <= 1 && n > 0 ? n * 100 : n);
    }
  }
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function isWithheldError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.mapped.code.includes('WITHHOLD') ||
      error.mapped.code.includes('CLEARANCE') ||
      error.mapped.code.includes('FEE'))
  );
}

export function StudentHome() {
  const { user } = useSession();
  const flags = useFeatureFlags();
  const [horizon, setHorizon] = useState<HomeHorizon>('today');
  const now = useNow();

  const overview = usePortalOverview();
  const timetable = usePortalTimetable();
  const events = usePortalEvents();
  const results = usePortalResults();

  const todayIso = toLocalISO(now);
  const weekStart = startOfWeek(now);
  const weekStartIso = toLocalISO(weekStart);
  const weekEndIso = toLocalISO(addDays(weekStart, 6));
  const termFromIso = toLocalISO(addDays(now, -90));

  const attendanceRange = useMemo(() => {
    if (horizon === 'week') {
      return { from: weekStartIso, to: weekEndIso };
    }
    if (horizon === 'term') {
      return { from: termFromIso, to: todayIso };
    }
    return undefined;
  }, [horizon, weekStartIso, weekEndIso, termFromIso, todayIso]);

  const attendance = usePortalAttendance(attendanceRange);

  const data = asRecord(overview.data);
  const child = asRecord(data?.child);
  const enrolment = asRecord(data?.enrolment);
  const period = asRecord(data?.academicPeriod);

  const classLabel =
    str(child?.className) ||
    str(enrolment?.className) ||
    str(enrolment?.classLabel) ||
    str(asRecord(enrolment?.class)?.name) ||
    str(asRecord(child?.class)?.name);

  const roomHint = str(enrolment?.roomName) || str(asRecord(enrolment?.room)?.name);
  const termHint = [str(period?.sessionName), str(period?.termName)].filter(Boolean).join(' · ');

  const resultsWithheld =
    data?.resultsWithheld === true ||
    isWithheldError(results.error) ||
    (!!asRecord(results.data) && isWithheldRow(asRecord(results.data)!));

  const today = dayCodeOf(now);
  const slots = useMemo(() => parseTimetable(timetable.data), [timetable.data]);
  const todaySlots = useMemo(
    () => (today ? slots.filter((slot) => slot.day === today) : []),
    [slots, today],
  );

  const attendanceStats = useMemo(() => {
    if (horizon === 'today') {
      return attendanceFromRows(toRecords(data?.attendanceRecent));
    }
    const rows = listFrom(attendance.data, 'entries', 'items', 'records');
    return attendanceFromRows(rows);
  }, [horizon, data?.attendanceRecent, attendance.data]);

  const average = useMemo(
    () => academicAverage(results.data, resultsWithheld),
    [results.data, resultsWithheld],
  );

  const allEvents = useMemo(
    () => listFrom(events.data, 'items', 'events'),
    [events.data],
  );

  const { upcomingCount, deadlines } = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let end = addDays(start, 14);
    if (horizon === 'today') end = addDays(start, 1);
    else if (horizon === 'week') end = addDays(weekStart, 7);
    else if (horizon === 'term') end = addDays(start, 90);

    const upcoming = allEvents
      .map((row) => ({ row, at: eventStart(row) }))
      .filter((item): item is { row: Record<string, unknown>; at: Date } => {
        if (!item.at) return false;
        return item.at >= start && item.at < end;
      })
      .sort((a, b) => a.at.getTime() - b.at.getTime());

    return {
      upcomingCount: upcoming.length,
      deadlines: upcoming.slice(0, 3).map((item) => item.row),
    };
  }, [allEvents, horizon, now, weekStart]);

  const kpis: HomeKpi[] = [
    {
      id: 'attendance',
      label: 'Current Attendance',
      icon: UserCheck,
      value: attendanceStats.rate === null ? '—' : `${attendanceStats.rate}%`,
      hint:
        horizon === 'today'
          ? 'Recent marks'
          : horizon === 'week'
            ? 'This week'
            : 'This term window',
      accent: 'academic',
    },
    {
      id: 'average',
      label: 'Academic Average',
      icon: GraduationCap,
      value: resultsWithheld ? 'See office' : average === null ? '—' : `${average}%`,
      locked: resultsWithheld,
      badge: !resultsWithheld && average !== null && average >= 70 ? 'Distinction' : undefined,
      hint: resultsWithheld ? 'Results held' : undefined,
    },
    {
      id: 'upcoming',
      label: 'Upcoming Event',
      icon: CalendarDays,
      value: String(upcomingCount),
      hint: horizon === 'today' ? 'Today' : horizon === 'week' ? 'This week' : 'Next 90 days',
    },
    {
      id: 'log',
      label: 'Attendance Log',
      icon: ClipboardList,
      value:
        attendanceStats.total === 0
          ? '—'
          : `${attendanceStats.present} / ${attendanceStats.total}`,
      hint: 'Present / marked',
    },
  ];

  const pending = overview.isPending || timetable.isPending;

  return (
    <div className="space-y-6">
      <HomeHeader horizon={horizon} onHorizonChange={setHorizon} />

      <QueryState
        isPending={pending}
        error={overview.error}
        onRetry={() => {
          void overview.refetch();
          void timetable.refetch();
        }}
      >
        <div className="space-y-6">
          {resultsWithheld ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-border bg-muted px-4 py-4 text-sm"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <p className="font-medium">{WITHHELD_COPY}</p>
            </div>
          ) : null}

          <HomeKpiStrip items={kpis} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] lg:items-start">
            <HomeTimetablePanel
              classLabel={classLabel}
              roomHint={roomHint}
              termHint={termHint}
              slots={todaySlots}
              now={now}
            />
            <HomeRightRail deadlines={deadlines} />
          </div>

          <HomeActionCenter isModuleEnabled={flags.isEnabled} />
        </div>
      </QueryState>
    </div>
  );
}
