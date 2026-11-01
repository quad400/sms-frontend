'use client';

import { BadgeCheck, Bell, ClipboardList, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/components/patterns/summary-card';
import { LESSON_PLANS_UI_MOCK } from './ui-mock';

export function LessonPlansSummary({
  awaiting,
  approved,
  overdue,
}: {
  awaiting?: number;
  approved?: number;
  overdue?: number;
}) {
  const s = LESSON_PLANS_UI_MOCK.summary;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Submission Rate"
        value={`${s.submissionRate}%`}
        icon={<TrendingUp className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <p className="text-xs font-semibold text-teal-700">{s.submissionDelta}</p>
      </SummaryCard>

      <SummaryCard
        label="Awaiting HOD Review"
        value={String(awaiting ?? s.awaiting).padStart(2, '0')}
        icon={<ClipboardList className="size-4" />}
        iconClass="bg-amber-50 text-amber-800"
      >
        <Badge variant="warning" size="sm">
          Priority
        </Badge>
        <p className="mt-1.5 text-xs text-muted-foreground">{s.awaitingCutoff}</p>
      </SummaryCard>

      <SummaryCard
        label="Vetted & Approved"
        value={String(approved ?? s.approved).padStart(2, '0')}
        icon={<BadgeCheck className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <Badge variant="info" size="sm">
          Ready
        </Badge>
      </SummaryCard>

      <SummaryCard
        label="Overdue Submissions"
        value={String(overdue ?? s.overdue).padStart(2, '0')}
        icon={<Bell className="size-4" />}
        iconClass="bg-rose-50 text-rose-800"
      >
        <Badge variant="dangerSoft" size="sm">
          Action Req.
        </Badge>
        <p className="mt-1.5 text-xs text-rose-800/80">{s.overdueNote}</p>
      </SummaryCard>
    </div>
  );
}

