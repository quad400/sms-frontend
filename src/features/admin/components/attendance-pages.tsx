'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { AttendanceRegister, StaffAttendanceRow } from '../api/attendance';
import { useStaffList } from '../hooks/use-staff';
import {
  useAttendanceSummaries,
  useRegister,
  useRegisters,
  useReopenRegister,
  useSaveRegisterEntries,
  useSaveStaffAttendance,
  useStaffAttendance,
} from '../hooks/use-attendance';
import { useClasses } from '../hooks/use-structure';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const MARKS = ['present', 'absent', 'late', 'excused'] as const;

export function AttendanceOverviewPage() {
  const { campusQuery, density } = useAdminCampus();
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);
  const registers = useRegisters({ date, campusId: campusQuery, page });
  const summaries = useAttendanceSummaries({ from: date, to: date, campusId: campusQuery });
  const classes = useClasses({ campusId: campusQuery });

  const className = useMemo(() => {
    const m = new Map((classes.data ?? []).map((c) => [c.id, c.name]));
    return (id: number) => m.get(id) ?? `Class ${id}`;
  }, [classes.data]);

  const columns: DataTableColumn<AttendanceRegister>[] = [
    {
      id: 'class',
      header: 'Class',
      cell: (r) => (
        <Link
          className={
            r.status !== 'submitted'
              ? 'font-medium text-amber-700 hover:underline dark:text-amber-300'
              : 'text-primary hover:underline'
          }
          href={`/admin/attendance/registers/${r.id}`}
        >
          {r.className ?? className(r.classId)}
        </Link>
      ),
    },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'present',
      header: 'Present',
      cell: (r) => r.counts?.present ?? '—',
    },
    {
      id: 'absent',
      header: 'Absent',
      cell: (r) => r.counts?.absent ?? '—',
    },
  ];

  const summaryClasses = summaries.data?.classes ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description="Registers for the selected date. Unsubmitted classes are highlighted."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/attendance/reports">Reports</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/staff-attendance">Staff attendance</Link>
            </Button>
          </div>
        }
      />
      <Input type="date" className="max-w-[12rem]" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <QueryState isPending={registers.isPending} error={registers.error} onRetry={() => void registers.refetch()}>
          <DataTable columns={columns} rows={registers.data?.data ?? []} density={density} />
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </QueryState>
        <aside className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
          <h2 className="font-heading font-semibold">Summary</h2>
          <p>Classes with data: {summaryClasses.length}</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {summaryClasses.slice(0, 8).map((c) => (
              <li key={c.classId}>
                {c.className ?? className(c.classId)} ·{' '}
                {c.attendanceRate != null ? `${Math.round(c.attendanceRate * 100)}%` : '—'}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export function RegisterDetailPage({ registerId }: { registerId: number }) {
  const reg = useRegister(registerId);
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

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Register #${registerId}`}
        description={
          reg.data
            ? `${reg.data.date} · Class ${reg.data.classId} · ${reg.data.status}`
            : undefined
        }
        actions={
          <div className="flex gap-2">
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
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-2 py-2">Student</th>
              <th className="px-2 py-2">Mark</th>
              <th className="px-2 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {(reg.data?.entries ?? []).map((e) => (
              <tr key={String(e.id)} className="border-b border-border/70">
                <td className="px-2 py-2">{e.studentName ?? e.studentId}</td>
                <td className="px-2 py-2">
                  <select
                    className="h-9 rounded-md border border-border bg-background px-2"
                    value={marks[e.studentId] ?? 'present'}
                    onChange={(ev) => setMarks((prev) => ({ ...prev, [e.studentId]: ev.target.value }))}
                  >
                    {MARKS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={notes[e.studentId] ?? ''}
                    onChange={(ev) => setNotes((prev) => ({ ...prev, [e.studentId]: ev.target.value }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export function AttendanceReportsPage() {
  const { campusQuery } = useAdminCampus();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(today);
  const [classId, setClassId] = useState('');
  const [threshold, setThreshold] = useState('80');
  const classes = useClasses({ campusId: campusQuery });
  const summaries = useAttendanceSummaries({
    from,
    to,
    classId: classId || undefined,
    campusId: campusQuery,
  });

  const rows = (summaries.data?.classes ?? [])
    .map((c) => ({
      ...c,
      ratePct: c.attendanceRate != null ? Math.round(c.attendanceRate * 100) : null,
    }))
    .filter((c) => c.ratePct == null || c.ratePct <= Number(threshold))
    .sort((a, b) => (a.ratePct ?? 0) - (b.ratePct ?? 0));

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance reports" description="Lowest attendance by class for the selected range." />
      <div className="flex flex-wrap gap-3">
        <Input type="date" className="max-w-[11rem]" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="max-w-[11rem]" value={to} onChange={(e) => setTo(e.target.value)} />
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">All classes</option>
          {(classes.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          Threshold %
          <Input
            className="w-20"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </label>
      </div>
      <QueryState isPending={summaries.isPending} error={summaries.error} onRetry={() => void summaries.refetch()}>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.classId} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{r.className ?? `Class ${r.classId}`}</span>
              <span className="font-medium">{r.ratePct != null ? `${r.ratePct}%` : '—'}</span>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function StaffAttendancePage() {
  const { campusQuery } = useAdminCampus();
  const [date, setDate] = useState(today);
  const attendance = useStaffAttendance(date, campusQuery);
  const staff = useStaffList({ page: 1, campusId: campusQuery });
  const [marks, setMarks] = useState<Record<number, string>>({});

  useEffect(() => {
    const next: Record<number, string> = {};
    const records: StaffAttendanceRow[] = attendance.data?.records ?? [];
    for (const r of records) next[r.staffId] = r.markCode ?? 'present';
    for (const s of staff.data?.data ?? []) {
      if (next[s.id] == null) next[s.id] = 'present';
    }
    setMarks(next);
  }, [attendance.data, staff.data]);

  const save = useSaveStaffAttendance(date, campusQuery);
  function saveStaffMarks() {
    save.mutate(
      Object.entries(marks).map(([staffId, markCode]) => ({
        staffId: Number(staffId),
        markCode,
      })),
      {
        onSuccess: () => toastSuccess('Staff attendance saved'),
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff attendance"
        actions={
          <PermissionGate permission="attendance.staff.mark">
            <Button type="button" disabled={save.isPending} onClick={saveStaffMarks}>
              Save
            </Button>
          </PermissionGate>
        }
      />
      <Input type="date" className="max-w-[12rem]" value={date} onChange={(e) => setDate(e.target.value)} />
      <QueryState
        isPending={attendance.isPending || staff.isPending}
        error={attendance.error || staff.error}
        onRetry={() => {
          void attendance.refetch();
          void staff.refetch();
        }}
      >
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="px-2 py-2">Staff</th>
              <th className="px-2 py-2">Mark</th>
            </tr>
          </thead>
          <tbody>
            {(staff.data?.data ?? []).map((s) => (
              <tr key={s.id} className="border-b border-border/70">
                <td className="px-2 py-2">
                  {s.firstName} {s.lastName}
                </td>
                <td className="px-2 py-2">
                  <select
                    className="h-9 rounded-md border border-border bg-background px-2"
                    value={marks[s.id] ?? 'present'}
                    onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  >
                    {MARKS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </QueryState>
    </div>
  );
}
