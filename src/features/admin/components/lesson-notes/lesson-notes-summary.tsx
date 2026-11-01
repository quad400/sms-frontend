'use client';

import { SummaryCard } from '@/components/patterns/summary-card';
import { BadgeCheck, ClipboardList, XCircle } from 'lucide-react';

export function LessonNotesSummary({
  awaiting,
  approved,
  rejected,
}: {
  awaiting: number;
  approved: number;
  rejected: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Awaiting review"
        value={String(awaiting)}
        icon={<ClipboardList className="size-4" />}
        iconClass="bg-amber-50 text-amber-800"
      />
      <SummaryCard
        label="Approved"
        value={String(approved)}
        icon={<BadgeCheck className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      />
      <SummaryCard
        label="Rejected"
        value={String(rejected)}
        icon={<XCircle className="size-4" />}
        iconClass="bg-rose-50 text-rose-800"
      />
    </div>
  );
}

