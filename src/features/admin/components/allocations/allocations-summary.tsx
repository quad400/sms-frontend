'use client';

import { BookOpen, CheckCircle2, CircleDashed, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/components/patterns/summary-card';

export function AllocationsSummary({
  subjectCount,
  assignedCount,
  staffCovered,
}: {
  subjectCount: number;
  assignedCount: number;
  staffCovered: number;
}) {
  const unassigned = Math.max(0, subjectCount - assignedCount);
  const coverage =
    subjectCount > 0 ? Math.round((assignedCount / subjectCount) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Subjects in registry"
        value={String(subjectCount)}
        icon={<BookOpen className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      >
        <p className="text-xs text-muted-foreground">Available to assign</p>
      </SummaryCard>
      <SummaryCard
        label="Assigned this class"
        value={String(assignedCount)}
        icon={<CheckCircle2 className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      >
        <Badge variant="successSoft" size="sm">
          {coverage}% covered
        </Badge>
      </SummaryCard>
      <SummaryCard
        label="Still open"
        value={String(unassigned)}
        icon={<CircleDashed className="size-4" />}
        iconClass="bg-amber-50 text-amber-800"
      >
        <p className="text-xs text-muted-foreground">
          {unassigned === 0 ? 'All subjects staffed' : 'Need a teacher'}
        </p>
      </SummaryCard>
      <SummaryCard
        label="Teachers on load"
        value={String(staffCovered)}
        icon={<Users className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      >
        <p className="text-xs text-muted-foreground">Distinct staff on this arm</p>
      </SummaryCard>
    </div>
  );
}

