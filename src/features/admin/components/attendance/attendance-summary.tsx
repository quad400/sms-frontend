'use client';

import { SummaryCard } from '@/components/patterns/summary-card';
import { CheckCircle2, ClipboardList, Clock3, UserX } from 'lucide-react';

export type AttendanceKpis = {
  present: number;
  absent: number;
  late: number;
  ratePct: number | null;
  submitted: number;
  registers: number;
};

export function AttendanceSummary({ kpis }: { kpis: AttendanceKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Present"
        value={String(kpis.present)}
        icon={<CheckCircle2 className="size-4" />}
        iconClass="bg-emerald-50 text-emerald-700"
      />
      <SummaryCard
        label="Absent"
        value={String(kpis.absent)}
        icon={<UserX className="size-4" />}
        iconClass="bg-rose-50 text-rose-700"
      />
      <SummaryCard
        label="Late"
        value={String(kpis.late)}
        icon={<Clock3 className="size-4" />}
        iconClass="bg-amber-50 text-amber-800"
      />
      <SummaryCard
        label="Attendance rate"
        value={kpis.ratePct != null ? `${kpis.ratePct}%` : '—'}
        icon={<CheckCircle2 className="size-4" />}
        iconClass="bg-teal-50 text-teal-700"
      />
      <SummaryCard
        label="Registers submitted"
        value={`${kpis.submitted}/${kpis.registers}`}
        icon={<ClipboardList className="size-4" />}
        iconClass="bg-sky-50 text-sky-700"
      />
    </div>
  );
}

