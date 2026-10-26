'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ClassPicker } from '@/components/patterns/class-picker';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterBar, FilterSelect } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { PermissionGate, useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useArchiveStudent, useStudents } from '../hooks/use-students';
import { useClasses } from '../hooks/use-structure';
import { STUDENT_STATUS_CODES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { fullName, type StudentRow } from '../types';
import { ImportWizard } from './import-wizard';

export function StudentsList() {
  const { can } = useSession();
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('');
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const params = useMemo(
    () => ({ page, q: q || undefined, campusId: campusQuery, classId: classId || undefined, status: status || undefined }),
    [page, q, campusQuery, classId, status],
  );

  const students = useStudents(params);
  const classes = useClasses({ campusId: campusQuery, key: campusQuery });
  const archive = useArchiveStudent();

  const columns: DataTableColumn<StudentRow>[] = [
    {
      id: 'number',
      header: 'Number',
      cell: (r) => <span className="font-mono text-xs">{r.studentNumber}</span>,
    },
    {
      id: 'name',
      header: 'Name',
      cell: (r) => (
        <Link className="font-medium text-primary hover:underline" href={`/admin/students/${r.id}`}>
          {fullName(r.firstName, r.lastName, r.middleName)}
        </Link>
      ),
    },
    {
      id: 'class',
      header: 'Class',
      cell: (r) => r.className ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.statusCode ?? r.status ?? 'active'} />,
    },
    {
      id: 'phone',
      header: 'Guardian',
      cell: (r) => r.primaryGuardianPhone ?? '—',
    },
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/students/${r.id}`}>View</Link>
          </Button>
          <PermissionGate permission="students.student.update">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/students/${r.id}/edit`}>Edit</Link>
            </Button>
          </PermissionGate>
          <PermissionGate permission="students.student.archive">
            <Button variant="ghost" size="sm" onClick={() => setArchiveId(r.id)}>
              Archive
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  if (can('fees.account.read')) {
    columns.splice(5, 0, {
      id: 'balance',
      header: 'Balance',
      cell: (r) =>
        r.balanceMinor != null ? (
          <span className="font-mono text-xs">{(r.balanceMinor / 100).toFixed(2)}</span>
        ) : (
          '—'
        ),
    });
  }

  const total = students.data?.meta.total ?? 0;
  const pageSize = students.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Students"
        description={`${total} student${total === 1 ? '' : 's'}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <PermissionGate permission="students.student.create">
              <Button asChild>
                <Link href="/admin/students/new">Add student</Link>
              </Button>
            </PermissionGate>
            <PermissionGate permission="import-export.import.create">
              <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <FilterBar search={q} onSearchChange={(v) => { setQ(v); setPage(1); }} searchPlaceholder="Search name or number…">
        <ClassPicker
          value={classId}
          onChange={(v) => { setClassId(v); setPage(1); }}
          classes={classes.data ?? []}
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={STUDENT_STATUS_CODES.map((s) => ({ value: s.code, label: s.label }))}
        />
      </FilterBar>
      <QueryState isPending={students.isPending} error={students.error} onRetry={() => void students.refetch()}>
        <DataTable columns={columns} rows={students.data?.data ?? []} density={density} />
        {pages > 1 ? (
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        ) : null}
      </QueryState>
      <ConfirmDialog
        open={archiveId !== null}
        onOpenChange={(open) => !open && setArchiveId(null)}
        title="Archive student?"
        description="The student will be soft-deleted and hidden from active lists."
        confirmLabel="Archive"
        destructive
        isPending={archive.isPending}
        onConfirm={() =>
          archiveId &&
          archive.mutate(archiveId, {
            onSuccess: () => {
              toastSuccess('Student archived');
              setArchiveId(null);
            },
            onError: (e) => toastError('Could not archive', e.message),
          })
        }
      />
      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultEntity="students"
        allowedEntities={['students', 'guardians']}
      />
    </div>
  );
}
