'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Grid3x3,
  Printer,
  Shield,
  Upload,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { EmptyState } from '@/components/patterns/empty-state';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import type { TimetableSlot } from '../../api/academics';
import {
  usePublishTimetable,
  useRooms,
  useSaveTimetableSlots,
  useTimeSlots,
  useTimetable,
} from '../../hooks/use-academics';
import { useStaffList } from '../../hooks/use-staff';
import { useClass, useSubjects } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

const selectCell =
  'h-8 w-full rounded-md border border-border bg-background px-1.5 text-[11px] text-foreground ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-ring print:border-0';

export function TimetableBuilderPage({ timetableId }: { timetableId: number }) {
  const { campusQuery } = useAdminCampus();
  const tt = useTimetable(timetableId);
  const slotsMeta = useTimeSlots();
  const subjects = useSubjects();
  const staff = useStaffList({ page: 1, campusId: campusQuery, status: 'active' });
  const rooms = useRooms(campusQuery);
  const schoolClass = useClass(tt.data?.classId ?? 0, tt.data?.classId != null);

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [clash, setClash] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSlots(tt.data?.slots ?? []);
  }, [tt.data]);

  const cellMap = useMemo(() => {
    const m = new Map<string, TimetableSlot>();
    for (const s of slots) m.set(`${s.weekday}-${s.timeSlotId}`, s);
    return m;
  }, [slots]);

  const teachingPeriods = (slotsMeta.data ?? []).filter((s) => !s.isBreak).length;
  const filled = slots.filter((s) => s.subjectId > 0).length;
  const fillPct =
    teachingPeriods > 0
      ? Math.round((filled / (teachingPeriods * WEEKDAYS.length)) * 100)
      : 0;

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
        void tt.refetch();
      },
      onError: (e) => toastError('Could not publish', e.message),
    });
  }

  function setCell(weekday: string, timeSlotId: number, patch: Partial<TimetableSlot>) {
    setDirty(true);
    setSlots((prev) => {
      const key = `${weekday}-${timeSlotId}`;
      const existing = prev.find((s) => `${s.weekday}-${s.timeSlotId}` === key);
      if (!patch.subjectId && patch.subjectId === 0) {
        return prev.filter((s) => !(s.weekday === weekday && s.timeSlotId === timeSlotId));
      }
      if (!patch.subjectId && !existing && patch.subjectId !== 0) return prev;
      if (existing) {
        const next = { ...existing, ...patch };
        if (!next.subjectId) {
          return prev.filter((s) => !(s.weekday === weekday && s.timeSlotId === timeSlotId));
        }
        return prev.map((s) =>
          s.weekday === weekday && s.timeSlotId === timeSlotId ? next : s,
        );
      }
      if (!patch.subjectId) return prev;
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

  const className = schoolClass.data?.name ?? (tt.data ? `Class ${tt.data.classId}` : null);
  const status = tt.data?.status ?? 'draft';
  const backHref = tt.data?.classId
    ? `/admin/timetables?classId=${tt.data.classId}`
    : '/admin/timetables';

  return (
    <div className="space-y-5 print:space-y-2">
      <div className="print:hidden space-y-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to timetables
        </Link>

        <PageHeader
          title={className ? `${className} schedule` : `Timetable #${timetableId}`}
          titleAddon={
            <StatusBadge status={status === 'published' ? 'active' : status} />
          }
          description={
            tt.data
              ? `Builder for timetable #${timetableId} · Term ${tt.data.termId}`
              : 'Load periods, teachers, and rooms for this arm.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={saveSlots}
                disabled={save.isPending}
              >
                {save.isPending ? 'Saving…' : 'Save now'}
              </Button>
              <PermissionGate permission="academics.timetable.publish">
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={() => setPublishOpen(true)}
                >
                  <Upload className="size-3.5" />
                  Publish
                </Button>
              </PermissionGate>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="size-3.5" />
                Print
              </Button>
            </div>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryChip
            label="Periods filled"
            value={`${filled}`}
            note={`${fillPct}% of weekly grid`}
            icon={<Grid3x3 className="size-4" />}
            iconClass="bg-teal-50 text-teal-700"
          />
          <SummaryChip
            label="Teaching bells"
            value={String(teachingPeriods)}
            note="Non-break slots / day"
            icon={<CalendarDays className="size-4" />}
            iconClass="bg-sky-50 text-sky-700"
          />
          <SummaryChip
            label="Clash detector"
            value={clash ? 'Fault' : 'Clear'}
            note={clash ?? 'Auto-saves every change'}
            icon={<Shield className="size-4" />}
            iconClass={clash ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}
            valueClass={clash ? 'text-rose-700' : undefined}
          />
        </div>

        {clash ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {clash}
          </p>
        ) : null}
      </div>

      <QueryState
        isPending={tt.isPending || slotsMeta.isPending}
        error={tt.error ?? slotsMeta.error}
        onRetry={() => {
          void tt.refetch();
          void slotsMeta.refetch();
        }}
      >
        {(slotsMeta.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No time slots configured"
            description="Define period bells before building class grids."
            className="bg-card shadow-[var(--shadow-card)]"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)] print:border-0 print:shadow-none">
            <table className="w-full min-w-[720px] border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky left-0 z-[1] bg-muted/40 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Period
                  </th>
                  {WEEKDAYS.map((d) => (
                    <th
                      key={d}
                      className="min-w-[8rem] px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground capitalize"
                    >
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(slotsMeta.data ?? []).map((ts) => (
                  <tr
                    key={ts.id}
                    className={cn(
                      'border-b border-border/70 last:border-0',
                      ts.isBreak && 'bg-muted/30',
                    )}
                  >
                    <td className="sticky left-0 z-[1] bg-card px-3 py-2 align-top print:bg-transparent">
                      <p className="font-semibold text-foreground">{ts.name}</p>
                      <p className="tabular-nums text-[10px] text-muted-foreground">
                        {ts.startTime}–{ts.endTime}
                      </p>
                      {ts.isBreak ? (
                        <Badge variant="secondary" size="sm" className="mt-1">
                          Break
                        </Badge>
                      ) : null}
                    </td>
                    {WEEKDAYS.map((day) => {
                      const cell = cellMap.get(`${day}-${ts.id}`);
                      const hasClash = !!clash && !!cell;
                      return (
                        <td
                          key={day}
                          className={cn(
                            'border-l border-border/50 p-1.5 align-top',
                            hasClash && 'bg-rose-50/80 outline outline-2 outline-rose-400',
                          )}
                        >
                          {ts.isBreak ? (
                            <span className="block py-4 text-center text-[10px] text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <div className="grid gap-1 print:gap-0">
                              <Label className="sr-only">Subject {day} {ts.name}</Label>
                              <select
                                className={selectCell}
                                value={cell?.subjectId ?? ''}
                                onChange={(e) =>
                                  setCell(day, ts.id, {
                                    subjectId: e.target.value ? Number(e.target.value) : 0,
                                    teacherStaffId: cell?.teacherStaffId ?? 0,
                                    roomId: cell?.roomId ?? null,
                                  })
                                }
                              >
                                <option value="">Subject</option>
                                {(subjects.data ?? []).map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.code}
                                  </option>
                                ))}
                              </select>
                              <select
                                className={cn(selectCell, 'print:hidden')}
                                value={cell?.teacherStaffId ?? ''}
                                onChange={(e) =>
                                  setCell(day, ts.id, {
                                    subjectId: cell?.subjectId ?? 0,
                                    teacherStaffId: e.target.value
                                      ? Number(e.target.value)
                                      : 0,
                                    roomId: cell?.roomId ?? null,
                                  })
                                }
                              >
                                <option value="">Teacher</option>
                                {(staff.data?.data ?? []).map((st) => (
                                  <option key={st.id} value={st.id}>
                                    {fullName(st.firstName, st.lastName)}
                                  </option>
                                ))}
                              </select>
                              <select
                                className={cn(selectCell, 'print:hidden')}
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
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
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
        )}
      </QueryState>

      <ConfirmDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Publish timetable?"
        description="Published grids become the live schedule for this class arm and term."
        confirmLabel="Publish"
        isPending={publish.isPending}
        onConfirm={publishNow}
      />
    </div>
  );
}

function SummaryChip({
  label,
  value,
  note,
  icon,
  iconClass,
  valueClass,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums',
          valueClass,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
