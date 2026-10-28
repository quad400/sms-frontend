'use client';

import { Building2, CalendarDays, Ratio, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { STAFF_UI_MOCK } from './ui-mock';

export function StaffSummary() {
  const s = STAFF_UI_MOCK.summary;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Staff"
        value={String(s.total)}
        icon={<Users className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{s.teaching}</span> Teaching ·{' '}
          <span className="font-semibold text-foreground">{s.nonTeaching}</span> Non-Teaching
        </p>
      </SummaryCard>

      <SummaryCard
        label="On Duty Today"
        value={String(s.onDuty)}
        icon={<CalendarDays className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <p className="text-xs font-semibold text-emerald-700">{s.presentPct}% Present</p>
        {/* <p className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] font-medium text-amber-900">
          <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
          {s.leaveApproved} on approved medical / exam leave
        </p> */}
      </SummaryCard>

      <SummaryCard
        label="Student-Staff Ratio"
        value={s.studentStaffRatio}
        icon={<Ratio className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <span className="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          {s.ratioNote}
        </span>
      </SummaryCard>

      <SummaryCard
        label="Functional Units"
        value={String(s.functionalUnits)}
        icon={<Building2 className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <p className="text-xs text-muted-foreground">Across {s.campuses} Campuses</p>
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
