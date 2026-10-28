'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { toastError, toastSuccess } from '@/lib/toast';
import { useArchiveStudent, useStudents } from '../../hooks/use-students';
import { useClasses, useHouses, useSessions } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { ImportWizard } from '../import-wizard';
import { StudentDetailSheet } from './student-detail-sheet';
import { StudentsHeader } from './students-header';
import { StudentsSidebar } from './students-sidebar';
import { StudentsSummary } from './students-summary';
import { StudentsTable } from './students-table';

export function StudentsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery, density } = useAdminCampus();

  const studentIdParam = searchParams.get('studentId');
  const selectedId =
    studentIdParam && Number.isFinite(Number(studentIdParam))
      ? Number(studentIdParam)
      : null;

  const [sheetOpen, setSheetOpen] = useState(selectedId != null);
  const [sheetStudentId, setSheetStudentId] = useState<number | null>(selectedId);

  useEffect(() => {
    setSheetOpen(selectedId != null);
    setSheetStudentId(selectedId);
  }, [selectedId]);

  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [classId, setClassId] = useState('');
  const [houseId, setHouseId] = useState('');
  const [status, setStatus] = useState('active');
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
      classId: classId || undefined,
      status: status || undefined,
    }),
    [page, q, campusQuery, classId, status],
  );

  const students = useStudents(params);
  const classes = useClasses({ campusId: campusQuery, key: campusQuery });
  const houses = useHouses(campusQuery);
  const sessions = useSessions(campusQuery);
  const archive = useArchiveStudent();

  const activeSession = (sessions.data ?? []).find((s) => s.isActive) ?? null;

  const tableRows = useMemo(() => {
    const rows = students.data?.data ?? [];
    if (!houseId) return rows;
    const hid = Number(houseId);
    return rows.filter((r) => r.houseId === hid);
  }, [houseId, students.data?.data]);

  const total = students.data?.meta.total ?? 0;
  const pageSize = students.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const setStudentId = (id: number | null) => {
    if (id != null) {
      setSheetStudentId(id);
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
      setSheetStudentId(null);
    }
    const next = new URLSearchParams(searchParams.toString());
    if (id == null) next.delete('studentId');
    else next.set('studentId', String(id));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <StudentsHeader
        sessionName={activeSession?.name}
        onImport={() => setImportOpen(true)}
      />

      <StudentsSummary />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <StudentsTable
          rows={tableRows}
          isPending={students.isPending}
          error={students.error}
          onRetry={() => void students.refetch()}
          density={density}
          q={qInput}
          onQChange={setQInput}
          classId={classId}
          onClassIdChange={(v) => {
            setClassId(v);
            setPage(1);
          }}
          houseId={houseId}
          onHouseIdChange={(v) => {
            setHouseId(v);
            setPage(1);
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          classes={classes.data ?? []}
          houses={houses.data ?? []}
          page={page}
          pages={pages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onOpenStudent={(id) => setStudentId(id)}
          onArchive={setArchiveId}
        />
        <StudentsSidebar />
      </div>

      <StudentDetailSheet
        studentId={sheetStudentId}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setStudentId(null);
          else setSheetOpen(true);
        }}
      />

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
              if (selectedId === archiveId) setStudentId(null);
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
