'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useRegister,
  useReopenRegister,
  useSaveRegisterEntries,
} from '../../hooks/use-attendance';
import { useClasses } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';

const MARKS = ['present', 'absent', 'late', 'excused'] as const;

type EntryRow = {
  id: string;
  studentId: number;
  studentName: string;
  mark: string;
  note: string;
};

export function RegisterDetail({ registerId }: { registerId: number }) {
  const { campusQuery, density } = useAdminCampus();
  const reg = useRegister(registerId);
  const classes = useClasses({ campusId: campusQuery, key: campusQuery });
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [reopenOpen, setReopenOpen] = useState(false);

  useEffect(() => {
    const next: Record<number, string> = {};
    const n: Record<number, string> = {};
    for (const e of reg.data?.entries ?? []) {
      next[e.studentId] = e.markCode ?? e.mark ?? 'present';
      n[e.studentId] = e.note ?? '';
    }
    setMarks(next);
    setNotes(n);
  }, [reg.data]);

  const classLabel = useMemo(() => {
    const id = reg.data?.classId;
    if (id == null) return null;
    const found = (classes.data ?? []).find((c) => c.id === id);
    return found?.name ?? reg.data?.className ?? `Class ${id}`;
  }, [classes.data, reg.data]);

  const save = useSaveRegisterEntries(registerId);
  function saveMarks() {
    save.mutate(
      Object.entries(marks).map(([studentId, markCode]) => ({
        clientRef: `admin-${registerId}-${studentId}`,
        studentId: Number(studentId),
        markCode,
        note: notes[Number(studentId)] || undefined,
      })),
      {
        onSuccess: () => toastSuccess('Marks saved'),
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  }

  const reopen = useReopenRegister(registerId);
  function reopenNow(reason: string) {
    reopen.mutate(reason, {
      onSuccess: () => {
        toastSuccess('Register reopened');
        setReopenOpen(false);
      },
      onError: (e) => toastError('Could not reopen', e.message),
    });
  }

  const rows: EntryRow[] = useMemo(
    () =>
      (reg.data?.entries ?? []).map((e) => ({
        id: String(e.id),
        studentId: e.studentId,
        studentName: e.studentName ?? `Student ${e.studentId}`,
        mark: marks[e.studentId] ?? 'present',
        note: notes[e.studentId] ?? '',
      })),
    [reg.data?.entries, marks, notes],
  );

  const columns: DataTableColumn<EntryRow>[] = useMemo(
    () => [
      {
        id: 'student',
        header: 'Student',
        cell: (r) => <span className="font-semibold">{r.studentName}</span>,
      },
      {
        id: 'mark',
        header: 'Mark',
        cell: (r) => (
          <Select
            value={r.mark}
            onValueChange={(v) =>
              setMarks((prev) => ({ ...prev, [r.studentId]: v }))
            }
          >
            <SelectTrigger className="h-9 w-[9rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARKS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        id: 'note',
        header: 'Note',
        cell: (r) => (
          <Input
            value={r.note}
            onChange={(ev) =>
              setNotes((prev) => ({ ...prev, [r.studentId]: ev.target.value }))
            }
            className="max-w-xs"
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title={classLabel ? `${classLabel} register` : `Register #${registerId}`}
        description={reg.data ? reg.data.date : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {reg.data?.status ? <StatusBadge status={reg.data.status} /> : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/attendance">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back
              </Link>
            </Button>
            <PermissionGate permission="attendance.entry.mark">
              <Button type="button" disabled={save.isPending} onClick={saveMarks}>
                Save marks
              </Button>
            </PermissionGate>
            <PermissionGate permission="attendance.register.reopen">
              {reg.data?.status === 'submitted' ? (
                <Button type="button" variant="outline" onClick={() => setReopenOpen(true)}>
                  Reopen
                </Button>
              ) : null}
            </PermissionGate>
          </div>
        }
      />
      <QueryState isPending={reg.isPending} error={reg.error} onRetry={() => void reg.refetch()}>
        <div className="rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-card)]">
          <DataTable columns={columns} rows={rows} density={density} />
        </div>
      </QueryState>
      <ReasonDialog
        open={reopenOpen}
        onOpenChange={setReopenOpen}
        title="Reopen register?"
        confirmLabel="Reopen"
        isPending={reopen.isPending}
        onConfirm={reopenNow}
      />
    </div>
  );
}
