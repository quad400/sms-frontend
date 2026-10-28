'use client';

import { MetricList, type MetricRow } from '@/components/patterns/metric-list';
import { SectionCard } from '@/components/patterns/section-card';

const actionClass = 'text-[11px] font-semibold uppercase tracking-wide no-underline hover:underline';

export function EnrolmentByLevel({
  rows,
  genderLegend,
}: {
  rows: MetricRow[];
  genderLegend: boolean;
}) {
  return (
    <SectionCard
      title="Enrolment by level"
      description="Enrolment distribution across active year cohorts"
      action={{ label: 'Students →', href: '/admin/students' }}
      actionClassName={actionClass}
    >
      <MetricList rows={rows} emptyLabel="No enrolment snapshot yet" maxRows={12} />
      {genderLegend ? (
        <p className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-emerald-500/80" /> Male
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-sky-400/70" /> Female
          </span>
        </p>
      ) : null}
    </SectionCard>
  );
}
