'use client';

import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useArchiveStaff, useStaffList } from '../../hooks/use-staff';
import { useAdminCampus } from '../../lib/campus';
import { ImportWizard } from '../import-wizard';
import { StaffAnalytics } from './staff-analytics';
import { StaffHeader } from './staff-header';
import { StaffSummary } from './staff-summary';
import { StaffTable } from './staff-table';

/**
 * Staff directory — UI shell first.
 * Summary / category / analytics use presentational mock data until summary APIs land.
 * Table still loads real staff for interaction (profile, edit, archive).
 */
export function StaffList() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [employment, setEmployment] = useState('');
  const [category, setCategory] = useState('');
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const params = useMemo(
    () => ({
      page,
      q: q || undefined,
      campusId: campusQuery,
      status: 'active',
    }),
    [page, q, campusQuery],
  );

  const staff = useStaffList(params);
  const archive = useArchiveStaff();

  const total = staff.data?.meta.total ?? 0;
  const pageSize = staff.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-5">
      <StaffHeader onImport={() => setImportOpen(true)} />
      <StaffSummary />
      <StaffTable
        rows={staff.data?.data ?? []}
        isPending={staff.isPending}
        error={staff.error}
        onRetry={() => void staff.refetch()}
        density={density}
        q={qInput}
        onQChange={setQInput}
        department={department}
        onDepartmentChange={(v) => {
          setDepartment(v);
          setPage(1);
        }}
        employment={employment}
        onEmploymentChange={(v) => {
          setEmployment(v);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
        page={page}
        pages={pages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onArchive={setArchiveId}
      />
      <StaffAnalytics />

      <ConfirmDialog
        open={archiveId !== null}
        onOpenChange={(o) => !o && setArchiveId(null)}
        title="Archive staff member?"
        confirmLabel="Archive"
        destructive
        isPending={archive.isPending}
        onConfirm={() =>
          archiveId &&
          archive.mutate(archiveId, {
            onSuccess: () => {
              toastSuccess('Staff archived');
              setArchiveId(null);
            },
            onError: (e) => toastError('Could not archive', e.message),
          })
        }
      />
      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultEntity="staff"
        allowedEntities={['staff']}
      />
    </div>
  );
}
