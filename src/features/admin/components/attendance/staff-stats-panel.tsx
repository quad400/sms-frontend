'use client';

import { useEffect, useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { StaffAttendanceSummary } from '../../api/attendance';
import {
  useSaveStaffAttendance,
  useStaffAttendance,
  useStaffAttendanceSummaries,
} from '../../hooks/use-attendance';
import { useStaffList } from '../../hooks/use-staff';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { AttendanceFiltersBar } from './attendance-filters';

const MARKS = ['present', 'absent', 'late', 'excused'] as const;

function ratePct(rate: number | null) {
  return rate != null ? Math.round(rate * 100) : null;
}

type DayRow = { id: number; staffId: number; name: string; mark: string };
type StaffRangeRow = StaffAttendanceSummary & { id: number };

export function StaffStatsPanel({
  density,
  campusId,
  dayDate,
  onDayDateChange,
  from,
  to,
  onFromChange,
  onToChange,
}: {
  density: 'compact' | 'comfortable';
  campusId?: string;
  dayDate: string;
  onDayDateChange: (v: string) => void;
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  const attendance = useStaffAttendance(dayDate, campusId);
  const staff = useStaffList({ page: 1, campusId, status: 'active' });
  const summaries = useStaffAttendanceSummaries({ from, to, campusId });
  const [marks, setMarks] = useState<Record<number, string>>({});

  useEffect(() => {
    const next: Record<number, string> = {};
    for (const r of attendance.data ?? []) {
      next[r.staffId] = r.markCode ?? r.mark ?? 'present';
    }
    for (const s of staff.data?.data ?? []) {
      if (next[s.id] == null) next[s.id] = 'present';
    }
    setMarks(next);
  }, [attendance.data, staff.data]);

  const save = useSaveStaffAttendance(dayDate, campusId);
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

  const dayRows: DayRow[] = useMemo(
    () =>
      (staff.data?.data ?? []).map((s) => ({
        id: s.id,
        staffId: s.id,
        name: fullName(s.firstName, s.lastName),
        mark: marks[s.id] ?? 'present',
      })),
    [staff.data?.data, marks],
  );

  const rangeRows: StaffRangeRow[] = useMemo(
    () => (summaries.data?.staff ?? []).map((r) => ({ ...r, id: r.staffId })),
    [summaries.data?.staff],
  );

  const dayColumns: DataTableColumn<DayRow>[] = useMemo(
    () => [
      {
        id: 'staff',
        header: 'Staff',
        cell: (r) => <span className="font-semibold">{r.name}</span>,
      },
      {
        id: 'mark',
        header: 'Mark',
        cell: (r) => (
          <Select
            value={r.mark}
            onValueChange={(v) =>
              setMarks((prev) => ({ ...prev, [r.staffId]: v }))
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
    ],
    [],
  );

  const rangeColumns: DataTableColumn<StaffRangeRow>[] = useMemo(
    () => [
      {
        id: 'staff',
        header: 'Staff',
        cell: (r) => <span className="font-semibold">{r.staffName}</span>,
      },
      {
        id: 'present',
        header: 'Present',
        cell: (r) => <span className="tabular-nums">{r.counts?.present ?? 0}</span>,
      },
      {
        id: 'absent',
        header: 'Absent',
        cell: (r) => <span className="tabular-nums">{r.counts?.absent ?? 0}</span>,
      },
      {
        id: 'late',
        header: 'Late',
        cell: (r) => <span className="tabular-nums">{r.counts?.late ?? 0}</span>,
      },
      {
        id: 'total',
        header: 'Days',
        cell: (r) => <span className="tabular-nums">{r.total}</span>,
      },
      {
        id: 'rate',
        header: 'Attendance %',
        cell: (r) => {
          const pct = ratePct(r.attendanceRate);
          return (
            <span className="font-semibold tabular-nums">
              {pct != null ? `${pct}%` : '—'}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <AttendanceFiltersBar
          date={dayDate}
          onDateChange={onDayDateChange}
          dateLabel="Mark date"
          actions={
            <PermissionGate permission="attendance.staff.mark">
              <Button type="button" disabled={save.isPending} onClick={saveStaffMarks}>
                Save marks
              </Button>
            </PermissionGate>
          }
        />
        <QueryState
          isPending={attendance.isPending || staff.isPending}
          error={attendance.error || staff.error}
          onRetry={() => {
            void attendance.refetch();
            void staff.refetch();
          }}
        >
          <DataTable columns={dayColumns} rows={dayRows} density={density} />
        </QueryState>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-sm font-semibold">Cumulative attendance</h3>
        <AttendanceFiltersBar
          from={from}
          to={to}
          onFromChange={onFromChange}
          onToChange={onToChange}
        />
        <QueryState
          isPending={summaries.isPending}
          error={summaries.error}
          onRetry={() => void summaries.refetch()}
        >
          <DataTable columns={rangeColumns} rows={rangeRows} density={density} />
        </QueryState>
      </div>
    </div>
  );
}
