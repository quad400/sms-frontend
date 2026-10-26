'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { useStudents } from '../hooks/use-students';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { fullName, type StudentRow } from '../types';

/** Read-only transfer report — create transfers from the student profile. */
export function TransfersPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const students = useStudents({ page, status: 'transferred', campusId: campusQuery });

  const columns: DataTableColumn<StudentRow>[] = [
    {
      id: 'name',
      header: 'Student',
      cell: (r) => (
        <Link className="font-medium text-primary hover:underline" href={`/admin/students/${r.id}/enrolment`}>
          {fullName(r.firstName, r.lastName, r.middleName)}
        </Link>
      ),
    },
    { id: 'number', header: 'Number', cell: (r) => r.studentNumber },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.statusCode ?? r.status ?? 'transferred'} />,
    },
  ];

  const total = students.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (students.data?.meta.pageSize ?? 10)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transfers"
        description="Students marked transferred. Create a transfer from a student profile."
      />
      <QueryState isPending={students.isPending} error={students.error} onRetry={() => void students.refetch()}>
        <DataTable columns={columns} rows={students.data?.data ?? []} density={density} />
        {pages > 1 ? (
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page}/{pages} · {total} total
            </span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}
