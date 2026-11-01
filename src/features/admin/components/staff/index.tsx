'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useArchiveStaff, useStaffList, useStaffSummary } from '../../hooks/use-staff';
import { useCampuses } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { ImportWizard } from '../import-wizard';
import { StaffDetailSheet } from './staff-detail-sheet';
import { StaffHeader } from './staff-header';
import { StaffSidebar } from './staff-sidebar';
import { StaffSummary } from './staff-summary';
import { buildStaffCategoryTabs, StaffTable } from './staff-table';

export function StaffList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery, density } = useAdminCampus();

  const staffIdParam = searchParams.get('staffId');
  const selectedId =
    staffIdParam && Number.isFinite(Number(staffIdParam)) ? Number(staffIdParam) : null;

  const [sheetOpen, setSheetOpen] = useState(selectedId != null);
  const [sheetStaffId, setSheetStaffId] = useState<number | null>(selectedId);

  useEffect(() => {
    setSheetOpen(selectedId != null);
    setSheetStaffId(selectedId);
  }, [selectedId]);

  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('active');
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
      status: status || undefined,
      jobTitle: jobTitle || undefined,
      category: jobTitle ? undefined : category || undefined,
    }),
    [page, q, campusQuery, status, jobTitle, category],
  );

  const staff = useStaffList(params);
  const summary = useStaffSummary(campusQuery);
  const campuses = useCampuses();
  const archive = useArchiveStaff();

  const categoryTabs = useMemo(
    () => buildStaffCategoryTabs(summary.data),
    [summary.data],
  );

  const campusNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const campus of campuses.data ?? []) {
      map.set(campus.id, campus.name);
    }
    return map;
  }, [campuses.data]);

  const total = staff.data?.meta.total ?? 0;
  const pageSize = staff.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const setStaffId = (id: number | null) => {
    if (id != null) {
      setSheetStaffId(id);
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
      setSheetStaffId(null);
    }
    const next = new URLSearchParams(searchParams.toString());
    if (id == null) next.delete('staffId');
    else next.set('staffId', String(id));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <StaffHeader onImport={() => setImportOpen(true)} />
      <StaffSummary data={summary.data} isPending={summary.isPending} />

      <StaffTable
        rows={staff.data?.data ?? []}
        isPending={staff.isPending}
        error={staff.error}
        onRetry={() => void staff.refetch()}
        density={density}
        q={qInput}
        onQChange={setQInput}
        jobTitle={jobTitle}
        onJobTitleChange={(v) => {
          setJobTitle(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
        categoryTabs={categoryTabs}
        campusNameById={campusNameById}
        page={page}
        pages={pages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onArchive={setArchiveId}
        onOpenStaff={(id) => setStaffId(id)}
      />
      <StaffSidebar />

      <StaffDetailSheet
        staffId={sheetStaffId}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setStaffId(null);
          else setSheetOpen(true);
        }}
      />

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
              if (selectedId === archiveId) setStaffId(null);
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
