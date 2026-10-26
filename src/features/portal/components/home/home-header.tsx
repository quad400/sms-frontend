'use client';

import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';

export type HomeHorizon = 'today' | 'week' | 'term';

const HORIZONS = [
  { value: 'today' as const, label: 'Today' },
  { value: 'week' as const, label: 'This Week' },
  { value: 'term' as const, label: 'Full Term' },
];

export function HomeHeader({
  horizon,
  onHorizonChange,
}: {
  horizon: HomeHorizon;
  onHorizonChange: (value: HomeHorizon) => void;
}) {
  return (
    <PageHeader
      title="Dashboard"
      description="Track daily academic schedule, active classes, and performance metrics."
      actions={
        <SegmentedControl
          aria-label="Time horizon"
          value={horizon}
          onValueChange={onHorizonChange}
          options={HORIZONS}
        />
      }
    />
  );
}
