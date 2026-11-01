'use client';

import { CircleCheck, PieChart, UserCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SummaryCard } from '@/components/patterns/summary-card';
import type { StudentsSummary as StudentsSummaryData } from '../../api/students';

export function StudentsSummary({
  data,
  isPending,
}: {
  data: StudentsSummaryData | undefined;
  isPending?: boolean;
}) {
  const totalEnrolled = data?.totalEnrolled ?? 0;
  const male = data?.male ?? 0;
  const female = data?.female ?? 0;
  const active = data?.active ?? 0;
  const genderTotal = male + female;
  const malePct = genderTotal > 0 ? (male / genderTotal) * 100 : 0;
  const femalePct = genderTotal > 0 ? (female / genderTotal) * 100 : 0;
  const activePct = totalEnrolled > 0 ? (active / totalEnrolled) * 100 : 0;
  const attendanceRate = data?.attendanceRate ?? null;
  const enrolledThisTerm = data?.enrolledThisTerm ?? 0;
  const windowDays = data?.attendanceWindowDays ?? 30;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Enrolled"
        value={isPending ? '—' : totalEnrolled.toLocaleString()}
        icon={<Users className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <span className="inline-flex rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-700">
          {isPending
            ? '…'
            : enrolledThisTerm > 0
              ? `+${enrolledThisTerm.toLocaleString()} this term`
              : 'No new this term'}
        </span>
      </SummaryCard>

      <SummaryCard
        label="Gender Balance"
        value={
          isPending
            ? '—'
            : `${male.toLocaleString()} M / ${female.toLocaleString()} F`
        }
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
        label="Active students"
        value={isPending ? '—' : active.toLocaleString()}
        icon={<UserCheck className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-800"
      >
        <p className="text-[11px] text-muted-foreground">
          {isPending ? '…' : `${activePct.toFixed(1)}% of enrolled directory`}
        </p>
      </SummaryCard>

      <SummaryCard
        label="Attendance Rate"
        value={
          isPending
            ? '—'
            : attendanceRate != null
              ? `${attendanceRate}%`
              : '—'
        }
        icon={<CircleCheck className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          Last {windowDays}d
        </span>
      </SummaryCard>
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
