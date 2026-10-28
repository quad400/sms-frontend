'use client';

import { CheckCircle2, DoorOpen, Layers, Ratio, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { CLASSES_UI_MOCK } from './ui-mock';

export function ClassesSummary({
  armCount,
  assignedFormMasters,
}: {
  armCount: number;
  assignedFormMasters: number;
}) {
  const mock = CLASSES_UI_MOCK.summary;
  const unassigned = Math.max(0, armCount - assignedFormMasters);
  const formPct =
    armCount > 0 ? Math.round((assignedFormMasters / armCount) * 100) : mock.formMasterPct;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Active Cohort Arms"
        value={`${armCount || mock.homeroomReady.split('/')[0]?.trim() || 0} Arms`}
        icon={<Layers className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <p className="text-xs text-muted-foreground">{mock.coverageNote}</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold tabular-nums">
            <span className="text-muted-foreground">Cap utilisation</span>
            <span>{mock.capPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-teal-600"
              style={{ width: `${Math.min(100, mock.capPct)}%` }}
            />
          </div>
        </div>
      </SummaryCard>

      <SummaryCard
        label="Average Density"
        value={mock.avgDensity}
        icon={<Ratio className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="size-3.5" />
          {mock.densityNote}
        </p>
      </SummaryCard>

      <SummaryCard
        label="Form Master Roster"
        value={`${armCount > 0 ? formPct : mock.formMasterPct}%`}
        icon={<UserCheck className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs text-muted-foreground">
          {armCount > 0 ? unassigned : mock.formMasterUnassigned} unassigned faculty tutors
        </p>
        <span className="mt-1.5 inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          {armCount > 0
            ? `${assignedFormMasters} of ${armCount} allocated`
            : `${mock.formMasterPct}% allocated`}
        </span>
      </SummaryCard>

      <SummaryCard
        label="Homeroom Readiness"
        value={armCount > 0 ? `${armCount} / ${armCount}` : mock.homeroomReady}
        icon={<DoorOpen className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <p className="text-xs text-muted-foreground">{mock.homeroomNote}</p>
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
