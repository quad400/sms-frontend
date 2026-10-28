'use client';

import { SectionCard } from '@/components/patterns/section-card';
import { SparkLine } from '@/components/patterns/spark-line';
import type { SparkPoint } from '@/components/patterns/spark-bars';

const actionClass = 'text-[11px] font-semibold uppercase tracking-wide no-underline hover:underline';

export function AttendanceTrend({
  points,
  target,
}: {
  points: SparkPoint[];
  target?: number | null;
}) {
  return (
    <SectionCard
      title="Attendance trend"
      description="Last 14 snapshot points (daily percentage)"
      action={{ label: 'Open registers →', href: '/admin/attendance' }}
      actionClassName={actionClass}
    >
      <SparkLine points={points} target={target} emptyLabel="No attendance snapshot yet" />
    </SectionCard>
  );
}
