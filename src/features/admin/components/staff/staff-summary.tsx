'use client';

import { Building2, CalendarDays, Ratio, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SummaryCard } from '@/components/patterns/summary-card';
import type { StaffSummary as StaffSummaryData } from '../../api/staff';

export function StaffSummary({
  data,
  isPending,
}: {
  data: StaffSummaryData | undefined;
  isPending?: boolean;
}) {
  const total = data?.total ?? 0;
  const teaching = data?.teaching ?? 0;
  const nonTeaching = data?.nonTeaching ?? 0;
  const onDuty = data?.onDuty ?? 0;
  const presentPct = data?.presentPct;
  const leaveApproved = data?.leaveApproved ?? 0;
  const ratio = data?.studentStaffRatio ?? '—';
  const ratioNote = data?.ratioNote ?? '';
  const functionalUnits = data?.functionalUnits ?? 0;
  const campuses = data?.campuses ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Staff"
        value={isPending ? '—' : total.toLocaleString()}
        icon={<Users className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs text-muted-foreground">
          {isPending ? (
            '…'
          ) : (
            <>
              <span className="font-semibold text-foreground">{teaching.toLocaleString()}</span>{' '}
              Teaching ·{' '}
              <span className="font-semibold text-foreground">
                {nonTeaching.toLocaleString()}
              </span>{' '}
              Non-Teaching
            </>
          )}
        </p>
      </SummaryCard>

      <SummaryCard
        label="On Duty Today"
        value={isPending ? '—' : onDuty.toLocaleString()}
        icon={<CalendarDays className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        {isPending ? (
          <p className="text-xs text-muted-foreground">…</p>
        ) : presentPct != null ? (
          <p className="text-xs font-semibold text-emerald-700">{presentPct}% Present</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {leaveApproved > 0
              ? `${leaveApproved.toLocaleString()} on approved leave · no attendance marked yet`
              : 'No attendance marked yet'}
          </p>
        )}
      </SummaryCard>

      <SummaryCard
        label="Student-Staff Ratio"
        value={isPending ? '—' : ratio}
        icon={<Ratio className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        {isPending || !ratioNote ? null : (
          <span
            className={cn(
              'inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
              data?.studentStaffRatioValue != null &&
                data.studentStaffRatioValue <= 25
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {ratioNote}
          </span>
        )}
      </SummaryCard>

      <SummaryCard
        label="Functional Units"
        value={isPending ? '—' : functionalUnits.toLocaleString()}
        icon={<Building2 className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <p className="text-xs text-muted-foreground">
          {isPending
            ? '…'
            : `Across ${campuses.toLocaleString()} Campus${campuses === 1 ? '' : 'es'}`}
        </p>
      </SummaryCard>
    </div>
  );
}

