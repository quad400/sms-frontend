'use client';

import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { cn } from '@/lib/utils/cn';
import { DAY_SHORT, WEEK_DAYS, type DayCode } from '../../lib/schedule';

export type TimetableView = 'daily' | 'week';

const VIEW_OPTIONS = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'week' as const, label: 'Full week' },
];

export function TimetableHeader({
  view,
  onViewChange,
  activeDay,
  today,
  onDayChange,
}: {
  view: TimetableView;
  onViewChange: (view: TimetableView) => void;
  activeDay: DayCode | null;
  today: DayCode | null;
  onDayChange: (day: DayCode) => void;
}) {
  return (
    <PageHeader
      title="Class Schedule & Daily Periods"
      description="Your periods, rooms, and teachers with live period highlighting when class is in session."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          aria-label="Timetable view"
          value={view}
          onValueChange={onViewChange}
          options={VIEW_OPTIONS}
          className="w-full sm:w-fit"
        />

        {view === 'daily' ? (
          <div
            className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-card)]"
            role="group"
            aria-label="Day"
          >
            {WEEK_DAYS.map((code) => {
              const selected = activeDay === code;
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onDayChange(code)}
                  className={cn(
                    'relative min-w-[3.25rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none',
                    selected
                      ? 'bg-academic text-academic-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {DAY_SHORT[code]}
                  {today === code && !selected ? (
                    <span
                      className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-academic"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </PageHeader>
  );
}
