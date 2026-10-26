'use client';

import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';

export type LessonsFilter = 'all' | 'today' | 'week' | 'notes';

export function LessonsHeader({
  filter,
  onFilterChange,
  options,
  showFilters,
}: {
  filter: LessonsFilter;
  onFilterChange: (value: LessonsFilter) => void;
  options: readonly { value: LessonsFilter; label: string }[];
  showFilters: boolean;
}) {
  return (
    <PageHeader
      title="Live Classes"
      description="Join real-time lectures and open meet links when your teachers schedule them."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/student/timetable">
            <CalendarDays aria-hidden />
            Open timetable
          </Link>
        </Button>
      }
    >
      {showFilters ? (
        <SegmentedControl
          aria-label="Session filter"
          value={filter}
          onValueChange={onFilterChange}
          options={options}
          className="w-full overflow-x-auto sm:w-fit"
        />
      ) : null}
    </PageHeader>
  );
}
