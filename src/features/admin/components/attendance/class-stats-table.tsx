'use client';

import { useMemo } from 'react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import type { AttendanceSummary } from '../../api/attendance';
import type { SchoolClass } from '../../api/structure';
import { QueryState } from '../../lib/shared';
import { AttendanceFiltersBar } from './attendance-filters';

function ratePct(rate: number | null | undefined) {
  return rate != null ? Math.round(rate * 100) : null;
}

export function ClassStatsTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  from,
  to,
  onFromChange,
  onToChange,
  classId,
  onClassIdChange,
  classes,
  className,
}: {
  rows: AttendanceSummary[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  classId: string;
  onClassIdChange: (v: string) => void;
  classes: SchoolClass[];
  className: (id: number) => string;
}) {
  type ClassRow = AttendanceSummary & { id: number; ratePct: number | null };

  const columns: DataTableColumn<ClassRow>[] = useMemo(
    () => [
      {
        id: 'class',
        header: 'Class',
        cell: (r) => (
          <span className="font-semibold">{r.className ?? className(r.classId)}</span>
        ),
      },
      {
        id: 'registers',
        header: 'Registers',
        cell: (r) => (
          <span className="tabular-nums">
            {r.submittedRegisters ?? 0}/{r.registers ?? 0}
          </span>
        ),
      },
      {
        id: 'present',
        header: 'Present',
        cell: (r) => <span className="tabular-nums">{r.counts?.present ?? 0}</span>,
      },
      {
        id: 'absent',
        header: 'Absent',
        cell: (r) => <span className="tabular-nums">{r.counts?.absent ?? 0}</span>,
      },
      {
        id: 'late',
        header: 'Late',
        cell: (r) => <span className="tabular-nums">{r.counts?.late ?? 0}</span>,
      },
      {
        id: 'rate',
        header: 'Attendance %',
        cell: (r) => (
          <span className="font-semibold tabular-nums">
            {r.ratePct != null ? `${r.ratePct}%` : '—'}
          </span>
        ),
      },
    ],
    [className],
  );

  const enriched: ClassRow[] = rows
    .map((r) => ({
      ...r,
      id: r.classId,
      ratePct: ratePct(r.attendanceRate),
    }))
    .sort((a, b) => (a.ratePct ?? 101) - (b.ratePct ?? 101));

  return (
    <div className="space-y-3">
      <AttendanceFiltersBar
        from={from}
        to={to}
        onFromChange={onFromChange}
        onToChange={onToChange}
        classId={classId}
        onClassIdChange={onClassIdChange}
        classes={classes}
      />
      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <DataTable columns={columns} rows={enriched} density={density} />
      </QueryState>
    </div>
  );
}
