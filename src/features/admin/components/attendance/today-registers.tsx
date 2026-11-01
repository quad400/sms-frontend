'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { StatusBadge } from '@/components/patterns/status-badge';
import { TablePagination } from '@/components/patterns/table-pagination';
import type { AttendanceRegister } from '../../api/attendance';
import { QueryState } from '../../lib/shared';
import { AttendanceFiltersBar } from './attendance-filters';

export function TodayRegisters({
  rows,
  isPending,
  error,
  onRetry,
  density,
  date,
  onDateChange,
  className,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
}: {
  rows: AttendanceRegister[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  date: string;
  onDateChange: (v: string) => void;
  className: (id: number) => string;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const columns: DataTableColumn<AttendanceRegister>[] = useMemo(
    () => [
      {
        id: 'class',
        header: 'Class',
        cell: (r) => (
          <Link
            className={
              r.status !== 'submitted'
                ? 'font-semibold text-amber-700 hover:underline dark:text-amber-300'
                : 'font-semibold text-teal-700 hover:underline'
            }
            href={`/admin/attendance/registers/${r.id}`}
          >
            {r.className ?? className(r.classId)}
          </Link>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => <StatusBadge status={r.status} />,
      },
      {
        id: 'present',
        header: 'Present',
        cell: (r) => (
          <span className="tabular-nums">{r.counts?.present ?? '—'}</span>
        ),
      },
      {
        id: 'absent',
        header: 'Absent',
        cell: (r) => (
          <span className="tabular-nums">{r.counts?.absent ?? '—'}</span>
        ),
      },
      {
        id: 'late',
        header: 'Late',
        cell: (r) => (
          <span className="tabular-nums">{r.counts?.late ?? '—'}</span>
        ),
      },
    ],
    [className],
  );

  return (
    <div className="space-y-3">
      <AttendanceFiltersBar date={date} onDateChange={onDateChange} />
      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <DataTable columns={columns} rows={rows} density={density} />
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
