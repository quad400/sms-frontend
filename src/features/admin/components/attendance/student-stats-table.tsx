'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { TablePagination } from '@/components/patterns/table-pagination';
import type { StudentAttendanceSummary } from '../../api/attendance';
import type { SchoolClass } from '../../api/structure';
import { QueryState } from '../../lib/shared';
import { AttendanceFiltersBar } from './attendance-filters';

function ratePct(rate: number | null) {
  return rate != null ? Math.round(rate * 100) : null;
}

export function StudentStatsTable({
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
  page,
  pages,
  total,
  pageSize,
  onPageChange,
}: {
  rows: StudentAttendanceSummary[];
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
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  type StudentRow = StudentAttendanceSummary & { id: number };

  const columns: DataTableColumn<StudentRow>[] = useMemo(
    () => [
      {
        id: 'student',
        header: 'Student',
        cell: (r) => (
          <Link
            href={`/admin/students/${r.studentId}/attendance`}
            className="font-semibold text-teal-700 hover:underline"
          >
            {r.studentName}
          </Link>
        ),
      },
      {
        id: 'class',
        header: 'Class',
        cell: (r) => <span className="text-sm">{r.className}</span>,
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
        id: 'total',
        header: 'Sessions',
        cell: (r) => <span className="tabular-nums">{r.total}</span>,
      },
      {
        id: 'rate',
        header: 'Attendance %',
        cell: (r) => {
          const pct = ratePct(r.attendanceRate);
          return (
            <span className="font-semibold tabular-nums">
              {pct != null ? `${pct}%` : '—'}
            </span>
          );
        },
      },
    ],
    [],
  );

  const tableRows: StudentRow[] = rows.map((r) => ({ ...r, id: r.studentId }));

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
        <DataTable columns={columns} rows={tableRows} density={density} />
        <TablePagination
          page={page}
          pages={pages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </QueryState>
    </div>
  );
}
