'use client';

import { CalendarDays, Grid3x3, Shield, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/components/patterns/summary-card';
import { TIMETABLES_UI_MOCK } from './ui-mock';

export function TimetablesSummary({
  termLabel,
  timetableCount,
}: {
  termLabel?: string | null;
  timetableCount: number;
}) {
  const s = TIMETABLES_UI_MOCK.summary;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Active Master Schedule"
        value={termLabel || s.termLabel}
        icon={<CalendarDays className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
        valueClass="text-lg"
      >
        <p className="text-xs text-muted-foreground">{s.weekLabel}</p>
        {timetableCount > 0 ? (
          <Badge variant="successSoft" size="sm" className="mt-1.5">
            {timetableCount} published grids
          </Badge>
        ) : null}
      </SummaryCard>

      <SummaryCard
        label="Weekly Periods Scheduled"
        value={s.periodsFilled}
        icon={<Grid3x3 className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs text-muted-foreground">{s.periodsNote}</p>
      </SummaryCard>

      <SummaryCard
        label="Collision Detector"
        value={`${s.collisions} Detected Faults`}
        icon={<Shield className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
        valueClass="text-lg"
      >
        <Badge variant="successSoft" size="sm">
          {s.collisionMode}
        </Badge>
        <p className="mt-1 text-xs text-muted-foreground">Zero teacher / room clashes</p>
      </SummaryCard>

      <SummaryCard
        label="Facility Saturation"
        value={`${s.facilitySaturation}%`}
        icon={<Waves className="size-4" />}
        iconClass="bg-violet-50 text-violet-700"
      >
        <div className="mt-1 space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-violet-500"
              style={{ width: `${Math.min(100, s.facilitySaturation)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">High density in labs & studios</p>
        </div>
      </SummaryCard>
    </div>
  );
}

