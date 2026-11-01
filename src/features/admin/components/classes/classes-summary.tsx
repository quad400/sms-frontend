'use client';

import { CheckCircle2, DoorOpen, Layers, Ratio, UserCheck } from 'lucide-react';
import { SummaryCard } from '@/components/patterns/summary-card';
import type { SchoolClass } from '../../api/structure';

export function ClassesSummary({
  classes,
  isPending,
}: {
  classes: SchoolClass[];
  isPending?: boolean;
}) {
  const armCount = classes.length;
  const assignedFormMasters = classes.filter((c) => c.formTeacherStaffId != null).length;
  const unassigned = Math.max(0, armCount - assignedFormMasters);
  const formPct = armCount > 0 ? Math.round((assignedFormMasters / armCount) * 100) : 0;
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);
  const avgDensity = armCount > 0 ? totalStudents / armCount : 0;
  const armsWithStudents = classes.filter((c) => (c.studentCount ?? 0) > 0).length;
  const stageCoverage = summarizeStages(classes);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Active Cohort Arms"
        value={isPending ? '—' : `${armCount} Arms`}
        icon={<Layers className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <p className="text-xs text-muted-foreground">
          {isPending ? '…' : stageCoverage || 'No level stages yet'}
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold tabular-nums">
            <span className="text-muted-foreground">Students enrolled</span>
            <span>{isPending ? '—' : totalStudents.toLocaleString()}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-teal-600"
              style={{
                width: `${armCount > 0 ? Math.min(100, (armsWithStudents / armCount) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </SummaryCard>

      <SummaryCard
        label="Average Density"
        value={isPending ? '—' : avgDensity.toFixed(1)}
        icon={<Ratio className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="size-3.5" />
          Students per arm
        </p>
      </SummaryCard>

      <SummaryCard
        label="Form Master Roster"
        value={isPending ? '—' : `${formPct}%`}
        icon={<UserCheck className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs text-muted-foreground">
          {unassigned} unassigned faculty tutor{unassigned === 1 ? '' : 's'}
        </p>
        <span className="mt-1.5 inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
          {assignedFormMasters} of {armCount} allocated
        </span>
      </SummaryCard>

      <SummaryCard
        label="Enrolment coverage"
        value={isPending ? '—' : `${armsWithStudents} / ${armCount}`}
        icon={<DoorOpen className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <p className="text-xs text-muted-foreground">
          Arms with at least one active student
        </p>
      </SummaryCard>
    </div>
  );
}

function summarizeStages(classes: SchoolClass[]): string {
  const names = new Map<string, string>();
  for (const c of classes) {
    const code = c.levelStage;
    const name = c.levelStageName;
    if (code && name) names.set(code, name);
  }
  if (names.size === 0) {
    const levels = [...new Set(classes.map((c) => c.levelName).filter(Boolean))];
    return levels.length ? levels.slice(0, 3).join(' · ') : '';
  }
  return [...names.values()].join(' · ');
}
