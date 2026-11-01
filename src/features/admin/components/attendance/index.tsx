'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  useAttendanceSummaries,
  useRegisters,
  useStudentAttendanceSummaries,
} from '../../hooks/use-attendance';
import { useClasses } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { AttendanceHeader } from './attendance-header';
import { AttendanceSummary, type AttendanceKpis } from './attendance-summary';
import { ClassStatsTable } from './class-stats-table';
import { StaffStatsPanel } from './staff-stats-panel';
import { StudentStatsTable } from './student-stats-table';
import { TodayRegisters } from './today-registers';

export type AttendanceTab = 'today' | 'classes' | 'students' | 'staff';

const TABS: Array<{ id: AttendanceTab; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'classes', label: 'Classes' },
  { id: 'students', label: 'Students' },
  { id: 'staff', label: 'Staff' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function parseTab(raw: string | null): AttendanceTab {
  if (raw === 'classes' || raw === 'students' || raw === 'staff' || raw === 'today') {
    return raw;
  }
  return 'today';
}

export function AttendanceHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery, density } = useAdminCampus();

  const tab = parseTab(searchParams.get('tab'));
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(() => daysAgo(14));
  const [to, setTo] = useState(today);
  const [classId, setClassId] = useState('');
  const [page, setPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);

  const setTab = (next: AttendanceTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'today') params.delete('tab');
    else params.set('tab', next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setPage(1);
    setStudentPage(1);
  };

  const classes = useClasses({ campusId: campusQuery, key: campusQuery });
  const className = useMemo(() => {
    const m = new Map((classes.data ?? []).map((c) => [c.id, c.name]));
    return (id: number) => m.get(id) ?? `Class ${id}`;
  }, [classes.data]);

  const registers = useRegisters({ date, campusId: campusQuery, page });
  const daySummaries = useAttendanceSummaries({
    from: date,
    to: date,
    campusId: campusQuery,
  });
  const rangeSummaries = useAttendanceSummaries({
    from,
    to,
    classId: classId || undefined,
    campusId: campusQuery,
    enabled: tab === 'classes',
  });
  const studentSummaries = useStudentAttendanceSummaries({
    from,
    to,
    classId: classId || undefined,
    campusId: campusQuery,
    page: studentPage,
    enabled: tab === 'students',
  });

  const classRows = rangeSummaries.data?.classes ?? [];

  const kpis: AttendanceKpis = useMemo(() => {
    const source =
      tab === 'today'
        ? (daySummaries.data?.classes ?? [])
        : tab === 'classes'
          ? (rangeSummaries.data?.classes ?? [])
          : (daySummaries.data?.classes ?? []);
    let present = 0;
    let absent = 0;
    let late = 0;
    let total = 0;
    let submitted = 0;
    let registersCount = 0;
    for (const c of source) {
      present += c.counts?.present ?? 0;
      absent += c.counts?.absent ?? 0;
      late += c.counts?.late ?? 0;
      total += c.total ?? 0;
      submitted += c.submittedRegisters ?? 0;
      registersCount += c.registers ?? 0;
    }
    if (tab === 'today' && registers.data?.data) {
      // Prefer live register page totals for submitted/registers when available
      const list = registers.data.data;
      if (list.length > 0 && registersCount === 0) {
        registersCount = list.length;
        submitted = list.filter((r) => r.status === 'submitted').length;
        for (const r of list) {
          present += r.counts?.present ?? 0;
          absent += r.counts?.absent ?? 0;
          late += r.counts?.late ?? 0;
          total +=
            (r.counts?.present ?? 0) +
            (r.counts?.absent ?? 0) +
            (r.counts?.late ?? 0) +
            (r.counts?.excused ?? 0);
        }
      }
    }
    const attended = present + late;
    return {
      present,
      absent,
      late,
      ratePct: total > 0 ? Math.round((attended / total) * 100) : null,
      submitted,
      registers: registersCount,
    };
  }, [tab, daySummaries.data, rangeSummaries.data, registers.data]);

  const regMeta = registers.data?.meta;
  const regTotal = regMeta?.total ?? 0;
  const regPageSize = regMeta?.pageSize ?? 10;
  const regPages = Math.max(1, Math.ceil(regTotal / regPageSize));

  const stuMeta = studentSummaries.data?.meta;
  const stuTotal = stuMeta?.total ?? 0;
  const stuPageSize = stuMeta?.pageSize ?? 10;
  const stuPages = Math.max(1, Math.ceil(stuTotal / stuPageSize));

  return (
    <div className="space-y-5">
      <AttendanceHeader />
      <AttendanceSummary kpis={kpis} />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                active
                  ? 'bg-teal-700 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'today' ? (
        <TodayRegisters
          rows={registers.data?.data ?? []}
          isPending={registers.isPending}
          error={registers.error}
          onRetry={() => void registers.refetch()}
          density={density}
          date={date}
          onDateChange={(v) => {
            setDate(v);
            setPage(1);
          }}
          className={className}
          page={page}
          pages={regPages}
          total={regTotal}
          pageSize={regPageSize}
          onPageChange={setPage}
        />
      ) : null}

      {tab === 'classes' ? (
        <ClassStatsTable
          rows={classRows}
          isPending={rangeSummaries.isPending}
          error={rangeSummaries.error}
          onRetry={() => void rangeSummaries.refetch()}
          density={density}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          classId={classId}
          onClassIdChange={(v) => {
            setClassId(v);
          }}
          classes={classes.data ?? []}
          className={className}
        />
      ) : null}

      {tab === 'students' ? (
        <StudentStatsTable
          rows={studentSummaries.data?.data ?? []}
          isPending={studentSummaries.isPending}
          error={studentSummaries.error}
          onRetry={() => void studentSummaries.refetch()}
          density={density}
          from={from}
          to={to}
          onFromChange={(v) => {
            setFrom(v);
            setStudentPage(1);
          }}
          onToChange={(v) => {
            setTo(v);
            setStudentPage(1);
          }}
          classId={classId}
          onClassIdChange={(v) => {
            setClassId(v);
            setStudentPage(1);
          }}
          classes={classes.data ?? []}
          page={studentPage}
          pages={stuPages}
          total={stuTotal}
          pageSize={stuPageSize}
          onPageChange={setStudentPage}
        />
      ) : null}

      {tab === 'staff' ? (
        <StaffStatsPanel
          density={density}
          campusId={campusQuery}
          dayDate={date}
          onDayDateChange={setDate}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      ) : null}
    </div>
  );
}
