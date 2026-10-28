'use client';

import { BedDouble, CircleCheck, PieChart, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { STUDENTS_UI_MOCK } from './ui-mock';

export function StudentsSummary() {
  const s = STUDENTS_UI_MOCK.summary;
  const genderTotal = s.male + s.female;
  const malePct = (s.male / genderTotal) * 100;
  const femalePct = (s.female / genderTotal) * 100;
  const boardTotal = s.boarding + s.day;
  const boardPct = (s.boarding / boardTotal) * 100;
  const dayPct = (s.day / boardTotal) * 100;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Enrolled"
        value={s.totalEnrolled.toLocaleString()}
        icon={<Users className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <span className="inline-flex rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-700">
          {s.totalDelta}
        </span>
      </SummaryCard>

      <SummaryCard
        label="Gender Balance"
        value={`${s.male.toLocaleString()} M / ${s.female.toLocaleString()} F`}
        icon={<PieChart className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <RatioBar
          leftPct={malePct}
          rightPct={femalePct}
          leftClass="bg-teal-600"
          rightClass="bg-slate-800"
          leftLabel={`${malePct.toFixed(1)}% Male`}
          rightLabel={`${femalePct.toFixed(1)}% Female`}
        />
      </SummaryCard>

      <SummaryCard
        label="Boarding vs Day"
        value={`${s.boarding.toLocaleString()} Res. · ${s.day.toLocaleString()} Day`}
        icon={<BedDouble className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <RatioBar
          leftPct={boardPct}
          rightPct={dayPct}
          leftClass="bg-teal-600"
          rightClass="bg-slate-800"
          leftLabel={`${boardPct.toFixed(1)}% Res`}
          rightLabel={`${dayPct.toFixed(1)}% Day`}
        />
      </SummaryCard>

      <SummaryCard
        label="Attendance Rate"
        value={`${s.attendanceRate}%`}
        icon={<CircleCheck className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          {s.attendanceDelta}
        </span>
      </SummaryCard>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function RatioBar({
  leftPct,
  rightPct,
  leftClass,
  rightClass,
  leftLabel,
  rightLabel,
}: {
  leftPct: number;
  rightPct: number;
  leftClass: string;
  rightClass: string;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <span className={cn('h-full', leftClass)} style={{ width: `${leftPct}%` }} />
        <span className={cn('h-full', rightClass)} style={{ width: `${rightPct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
