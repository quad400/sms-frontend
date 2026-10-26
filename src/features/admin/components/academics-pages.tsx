'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { LessonPlan, Timetable, TimetableSlot } from '../api/academics';
import {
  useAllocations,
  useApproveLessonPlan,
  useCreateTimetable,
  useLessonPlan,
  useLessonPlans,
  usePublishTimetable,
  useRooms,
  useSaveAllocations,
  useSaveTimetableSlots,
  useTimeSlots,
  useTimetable,
  useTimetables,
} from '../hooks/use-academics';
import { useStaffList } from '../hooks/use-staff';
import {
  useClasses,
  useSessions,
  useSubjects,
  useTerms,
} from '../hooks/use-structure';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export function AllocationsPage() {
  const { campusQuery } = useAdminCampus();
  const sessions = useSessions(campusQuery);
  const [sessionId, setSessionId] = useState('');
  const activeSession =
    sessionId ||
    (sessions.data?.find((s) => s.isActive)?.id != null
      ? String(sessions.data.find((s) => s.isActive)!.id)
      : '');
  const classes = useClasses({ campusId: campusQuery, sessionId: activeSession || undefined });
  const subjects = useSubjects();
  const staff = useStaffList({ page: 1, campusId: campusQuery });
  const [classId, setClassId] = useState('');
  const [view, setView] = useState<'class' | 'teacher'>('class');
  const allocations = useAllocations(
    { classId: classId || undefined, sessionId: activeSession || undefined },
    !!classId || view === 'teacher',
  );

  const [map, setMap] = useState<Record<number, number>>({});
  useEffect(() => {
    const next: Record<number, number> = {};
    for (const row of allocations.data?.data ?? []) {
      if (!classId || row.classId === Number(classId)) next[row.subjectId] = row.staffId;
    }
    setMap(next);
  }, [allocations.data, classId]);

  const save = useSaveAllocations();
  function saveAllocations() {
    save.mutate(
      { map, classId, sessionId: activeSession, existing: allocations.data?.data ?? [] },
      {
        onSuccess: () => toastSuccess('Allocations saved'),
        onError: (e) => {
          if (e instanceof ApiClientError && /clash|book|422/i.test(e.message + e.mapped.code)) {
            toastError('Double booking', e.message);
            return;
          }
          toastError('Could not save', e.message);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Allocations"
        actions={
          <SegmentedControl
            aria-label="Allocation view"
            value={view}
            onValueChange={setView}
            options={[
              { value: 'class', label: 'By class' },
              { value: 'teacher', label: 'By teacher' },
            ]}
          />
        }
      />
      <div className="flex flex-wrap gap-3">
        <label className="grid gap-1 text-xs text-muted-foreground">
          Session
          <select
            className="h-10 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={activeSession}
            onChange={(e) => setSessionId(e.target.value)}
          >
            <option value="">Select…</option>
            {(sessions.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
        {view === 'class' ? (
          <label className="grid gap-1 text-xs text-muted-foreground">
            Class
            <select
              className="h-10 rounded-md border border-border bg-background px-2 text-sm text-foreground"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select…</option>
              {(classes.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {view === 'class' && classId ? (
        <QueryState isPending={allocations.isPending || subjects.isPending} error={allocations.error}>
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Subject</th>
                <th className="px-2 py-2">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {(subjects.data ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border/70">
                  <td className="px-2 py-2">{s.name}</td>
                  <td className="px-2 py-2">
                    <select
                      className="h-9 w-full max-w-xs rounded-md border border-border bg-background px-2"
                      value={map[s.id] ?? ''}
                      onChange={(e) =>
                        setMap((prev) => ({
                          ...prev,
                          [s.id]: e.target.value ? Number(e.target.value) : 0,
                        }))
                      }
                    >
                      <option value="">—</option>
                      {(staff.data?.data ?? []).map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.firstName} {st.lastName}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PermissionGate permission="staff.allocation.update">
            <Button
              type="button"
              className="mt-3"
              disabled={!activeSession || save.isPending}
              onClick={saveAllocations}
            >
              Save allocations
            </Button>
          </PermissionGate>
        </QueryState>
      ) : null}
      {view === 'teacher' ? (
        <QueryState isPending={allocations.isPending} error={allocations.error}>
          <ul className="space-y-2 text-sm">
            {(allocations.data?.data ?? []).map((a, i) => (
              <li key={a.id ?? i} className="rounded-lg border border-border px-3 py-2">
                Staff {a.staffName ?? a.staffId} · Class {a.className ?? a.classId} · Subject{' '}
                {a.subjectName ?? a.subjectId}
              </li>
            ))}
          </ul>
        </QueryState>
      ) : null}
    </div>
  );
}

export function TimetablesListPage() {
  const { campusQuery, density } = useAdminCampus();
  const search = useSearchParams();
  const classFilter = search.get('classId') ?? '';
  const [page, setPage] = useState(1);
  const list = useTimetables({ page, classId: classFilter || undefined });
  const classes = useClasses({ campusId: campusQuery });
  const terms = useTerms();
  const [classId, setClassId] = useState(classFilter);
  const [termId, setTermId] = useState('');
  const create = useCreateTimetable();
  function createNew() {
    create.mutate(
      { classId: Number(classId), termId: Number(termId) },
      {
        onSuccess: (t) => {
          toastSuccess('Timetable created');
          window.location.href = `/admin/timetables/${t.id}`;
        },
        onError: (e) => toastError('Could not create', e.message),
      },
    );
  }

  const columns: DataTableColumn<Timetable>[] = [
    {
      id: 'class',
      header: 'Class',
      cell: (r) => (
        <Link className="text-primary hover:underline" href={`/admin/timetables/${r.id}`}>
          Class {r.classId}
        </Link>
      ),
    },
    { id: 'term', header: 'Term', cell: (r) => r.termId },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'published', header: 'Published', cell: (r) => r.publishedAt ?? '—' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Timetables"
        actions={
          <PermissionGate permission="academics.timetable.create">
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">Class…</option>
                {(classes.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
              >
                <option value="">Term…</option>
                {(terms.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.periodName ?? t.name ?? t.id}</option>
                ))}
              </select>
              <Button
                type="button"
                disabled={!classId || !termId || create.isPending}
                onClick={createNew}
              >
                New
              </Button>
            </div>
          </PermissionGate>
        }
      />
      <QueryState isPending={list.isPending} error={list.error} onRetry={() => void list.refetch()}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </QueryState>
    </div>
  );
}

export function TimetableBuilderPage({ timetableId }: { timetableId: number }) {
  const { campusQuery } = useAdminCampus();
  const tt = useTimetable(timetableId);
  const slotsMeta = useTimeSlots();
  const subjects = useSubjects();
  const staff = useStaffList({ page: 1, campusId: campusQuery });
  const rooms = useRooms(campusQuery);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [clash, setClash] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    setSlots(tt.data?.slots ?? []);
  }, [tt.data]);

  const cellMap = useMemo(() => {
    const m = new Map<string, TimetableSlot>();
    for (const s of slots) m.set(`${s.weekday}-${s.timeSlotId}`, s);
    return m;
  }, [slots]);

  const save = useSaveTimetableSlots(timetableId);
  function saveSlots() {
    save.mutate(slots, {
      onSuccess: () => {
        setClash(null);
        toastSuccess('Timetable saved');
      },
      onError: (e) => {
        setClash(e.message);
        toastError('Clash or validation error', e.message);
      },
    });
  }

  const publish = usePublishTimetable(timetableId);
  function publishNow() {
    publish.mutate(undefined, {
      onSuccess: () => {
        toastSuccess('Published');
        setPublishOpen(false);
      },
      onError: (e) => toastError('Could not publish', e.message),
    });
  }

  const [dirty, setDirty] = useState(false);

  function setCell(weekday: string, timeSlotId: number, patch: Partial<TimetableSlot>) {
    setDirty(true);
    setSlots((prev) => {
      const key = `${weekday}-${timeSlotId}`;
      const existing = prev.find((s) => `${s.weekday}-${s.timeSlotId}` === key);
      if (!patch.subjectId && !existing) return prev;
      if (!patch.subjectId && existing && patch.subjectId === 0) {
        return prev.filter((s) => !(s.weekday === weekday && s.timeSlotId === timeSlotId));
      }
      if (existing) {
        return prev.map((s) =>
          s.weekday === weekday && s.timeSlotId === timeSlotId ? { ...s, ...patch } : s,
        );
      }
      return [
        ...prev,
        {
          weekday,
          timeSlotId,
          subjectId: patch.subjectId ?? 0,
          teacherStaffId: patch.teacherStaffId ?? 0,
          roomId: patch.roomId ?? null,
        },
      ];
    });
  }

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      saveSlots();
      setDirty(false);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, dirty]);

  return (
    <div className="space-y-5 print:space-y-2">
      <div className="print:hidden">
        <PageHeader
          title={`Timetable #${timetableId}`}
          description={tt.data ? `Class ${tt.data.classId} · ${tt.data.status}` : undefined}
          actions={
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={saveSlots} disabled={save.isPending}>
                Save
              </Button>
              <PermissionGate permission="academics.timetable.publish">
                <Button type="button" onClick={() => setPublishOpen(true)}>
                  Publish
                </Button>
              </PermissionGate>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          }
        />
        {clash ? <p className="text-sm text-destructive">{clash}</p> : null}
      </div>
      <QueryState isPending={tt.isPending || slotsMeta.isPending} error={tt.error}>
        <div className="overflow-x-auto rounded-xl border border-border print:border-0">
          <table className="w-full min-w-[800px] border-collapse text-xs print:text-[10px]">
            <thead>
              <tr>
                <th className="border border-border bg-muted/40 px-2 py-2 text-left">Period</th>
                {WEEKDAYS.map((d) => (
                  <th key={d} className="border border-border bg-muted/40 px-2 py-2 capitalize">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(slotsMeta.data ?? []).map((ts) => (
                <tr key={ts.id} className={ts.isBreak ? 'bg-muted/30' : undefined}>
                  <td className="border border-border px-2 py-1">
                    {ts.name}
                    <div className="text-xs text-muted-foreground">
                      {ts.startTime}–{ts.endTime}
                    </div>
                  </td>
                  {WEEKDAYS.map((day) => {
                    const cell = cellMap.get(`${day}-${ts.id}`);
                    const hasClash = !!clash && !!cell;
                    return (
                      <td
                        key={day}
                        className={`border border-border p-1 align-top ${hasClash ? 'outline outline-2 outline-destructive' : ''}`}
                      >
                        {ts.isBreak ? (
                          <span className="text-muted-foreground">Break</span>
                        ) : (
                          <div className="grid gap-1 print:gap-0">
                            <select
                              className="h-8 w-full rounded border border-border bg-background px-1 print:border-0"
                              value={cell?.subjectId ?? ''}
                              onChange={(e) =>
                                setCell(day, ts.id, {
                                  subjectId: e.target.value ? Number(e.target.value) : 0,
                                  teacherStaffId: cell?.teacherStaffId ?? 0,
                                })
                              }
                            >
                              <option value="">—</option>
                              {(subjects.data ?? []).map((s) => (
                                <option key={s.id} value={s.id}>{s.code}</option>
                              ))}
                            </select>
                            <select
                              className="h-8 w-full rounded border border-border bg-background px-1 print:hidden"
                              value={cell?.teacherStaffId ?? ''}
                              onChange={(e) =>
                                setCell(day, ts.id, {
                                  subjectId: cell?.subjectId ?? 0,
                                  teacherStaffId: e.target.value ? Number(e.target.value) : 0,
                                })
                              }
                            >
                              <option value="">Teacher</option>
                              {(staff.data?.data ?? []).map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.firstName}
                                </option>
                              ))}
                            </select>
                            <select
                              className="h-8 w-full rounded border border-border bg-background px-1 print:hidden"
                              value={cell?.roomId ?? ''}
                              onChange={(e) =>
                                setCell(day, ts.id, {
                                  subjectId: cell?.subjectId ?? 0,
                                  teacherStaffId: cell?.teacherStaffId ?? 0,
                                  roomId: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                            >
                              <option value="">Room</option>
                              {(rooms.data ?? []).map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Publish timetable?"
        confirmLabel="Publish"
        isPending={publish.isPending}
        onConfirm={publishNow}
      />
    </div>
  );
}

export function LessonPlansPage() {
  const [status, setStatus] = useState('submitted');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const { density } = useAdminCampus();
  const list = useLessonPlans({ status: status || undefined, page });
  const detail = useLessonPlan(selected);
  const approve = useApproveLessonPlan();
  function approvePlan(id: number) {
    approve.mutate(id, {
      onSuccess: () => {
        toastSuccess('Approved');
        setSelected(null);
      },
      onError: (e) => toastError('Could not approve', e.message),
    });
  }

  const columns: DataTableColumn<LessonPlan>[] = [
    { id: 'title', header: 'Title', cell: (r) => r.title },
    { id: 'class', header: 'Class', cell: (r) => r.className ?? r.classId },
    { id: 'subject', header: 'Subject', cell: (r) => r.subjectName ?? r.subjectId },
    { id: 'week', header: 'Week', cell: (r) => r.weekNumber ?? '—' },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Lesson plans" />
      <SegmentedControl
        aria-label="Lesson plan status"
        value={status}
        onValueChange={(v) => { setStatus(v); setPage(1); }}
        options={[
          { value: 'submitted', label: 'Submitted' },
          { value: 'approved', label: 'Approved' },
          { value: 'draft', label: 'Draft' },
        ]}
      />
      <QueryState isPending={list.isPending} error={list.error} onRetry={() => void list.refetch()}>
        <DataTable
          columns={columns}
          rows={list.data?.data ?? []}
          density={density}
          onRowClick={(r) => setSelected(r.id)}
        />
      </QueryState>
      <Sheet open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{detail.data?.title ?? 'Lesson plan'}</SheetTitle>
          </SheetHeader>
          <QueryState isPending={detail.isPending} error={detail.error}>
            <div className="mt-4 space-y-3 text-sm">
              <StatusBadge status={detail.data?.status ?? ''} />
              <p className="whitespace-pre-wrap">{detail.data?.content}</p>
              {detail.data?.objectives ? (
                <p className="text-muted-foreground">{detail.data.objectives}</p>
              ) : null}
              <PermissionGate permission="academics.lesson-plan.approve">
                {detail.data?.status === 'submitted' ? (
                  <Button type="button" disabled={approve.isPending} onClick={() => approvePlan(selected!)}>
                    Approve
                  </Button>
                ) : null}
              </PermissionGate>
            </div>
          </QueryState>
        </SheetContent>
      </Sheet>
    </div>
  );
}
