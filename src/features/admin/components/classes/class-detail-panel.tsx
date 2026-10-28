'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  MoreVertical,
  Printer,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import type { SchoolClass } from '../../api/structure';
import { useUpdateClass } from '../../hooks/use-structure';
import { useStudents } from '../../hooks/use-students';
import { QueryState } from '../../lib/shared';
import { fullName, type StaffRow } from '../../types';
import {
  classExtraForId,
  genderSplit,
  rosterExtraForIndex,
} from './ui-mock';

export function ClassDetailPanel({
  schoolClass,
  staff,
  invalidateKey,
  onClose,
}: {
  schoolClass: SchoolClass;
  staff: StaffRow[];
  invalidateKey: string;
  onClose?: () => void;
}) {
  const extra = classExtraForId(schoolClass.id);
  const roster = useStudents(
    { classId: String(schoolClass.id), page: 1 },
    true,
  );
  const update = useUpdateClass(invalidateKey);
  const [reassignOpen, setReassignOpen] = useState(false);

  const formTutor = useMemo(() => {
    if (!schoolClass.formTeacherStaffId) return null;
    return staff.find((s) => s.id === schoolClass.formTeacherStaffId) ?? null;
  }, [schoolClass.formTeacherStaffId, staff]);

  const students = roster.data?.data ?? [];
  const totalStudents =
    schoolClass.studentCount ?? roster.data?.meta.total ?? students.length;
  const split = genderSplit(totalStudents || extra.enrolled);

  const armLabel =
    schoolClass.armName ??
    schoolClass.name.split(/\s+/).pop() ??
    '—';

  const assignTutor = (staffId: string) => {
    update.mutate(
      {
        id: schoolClass.id,
        body: {
          formTeacherStaffId: staffId === 'none' ? null : Number(staffId),
        },
      },
      {
        onSuccess: () => {
          toastSuccess('Form tutor updated');
          setReassignOpen(false);
        },
        onError: (e) => toastError('Could not update form tutor', e.message),
      },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-heading text-sm font-bold text-teal-800">
          {armLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-heading text-base font-semibold tracking-tight">
                {schoolClass.name} Inspection
              </h2>
              <Badge variant="successSoft" size="sm" className="mt-1">
                Active Stream
              </Badge>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled>
                <Printer className="size-4" />
                <span className="sr-only">Print</span>
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled>
                <MoreVertical className="size-4" />
                <span className="sr-only">More</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <StatChip label="Boys" value={split.boys} />
          <StatChip label="Girls" value={split.girls} />
          <StatChip label="Boarders" value={split.boarders} />
          <StatChip label="Day Scholars" value={split.dayScholars} />
        </div>

        <section className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Form Tutor
            </p>
            <Badge variant="soft" size="sm">
              Form Tutor
            </Badge>
          </div>
          {formTutor ? (
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
                {(formTutor.firstName?.[0] ?? '') + (formTutor.lastName?.[0] ?? '')}
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold">
                  {fullName(formTutor.firstName, formTutor.lastName, formTutor.middleName)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formTutor.email || 'No email on file'}
                </p>
                <p className="text-xs text-muted-foreground">{extra.homeroom}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <UserRound className="size-4 shrink-0" />
              No form tutor assigned
            </div>
          )}

          {reassignOpen ? (
            <div className="mt-3 space-y-2">
              <Select
                onValueChange={assignTutor}
                disabled={update.isPending}
              >
                <SelectTrigger aria-label="Select form tutor">
                  <SelectValue placeholder="Select staff…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassign</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {fullName(s.firstName, s.lastName, s.middleName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReassignOpen(false)}
              >
                Cancel
              </Button>
            </div>
          ) : null}
        </section>

        <section className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Class Roster
            </h3>
            <Link
              href={`/admin/students?classId=${schoolClass.id}`}
              className="text-[11px] font-semibold text-teal-700 hover:underline"
            >
              View all
            </Link>
          </div>
          <QueryState
            isPending={roster.isPending}
            error={roster.error}
            onRetry={() => void roster.refetch()}
          >
            {students.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-xs text-muted-foreground">
                No students enrolled yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-1.5 font-semibold">Roll</th>
                      <th className="px-2 py-1.5 font-semibold">Student</th>
                      <th className="px-2 py-1.5 font-semibold">RFID</th>
                      <th className="px-2 py-1.5 font-semibold">GPA</th>
                      <th className="px-2 py-1.5 font-semibold">Att.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 8).map((s, i) => {
                      const mock = rosterExtraForIndex(i);
                      const name = fullName(s.firstName, s.lastName, s.middleName);
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-border/60 last:border-0"
                        >
                          <td className="px-2 py-1.5 font-mono tabular-nums text-muted-foreground">
                            #{String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="max-w-[7rem] truncate px-2 py-1.5 font-medium">
                            <Link
                              href={`/admin/students/${s.id}`}
                              className="hover:text-teal-700 hover:underline"
                            >
                              {name}
                            </Link>
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge
                              variant={
                                mock.status.kind === 'present'
                                  ? 'successSoft'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {mock.status.label}
                            </Badge>
                          </td>
                          <td className="px-2 py-1.5 tabular-nums">{mock.gpa}</td>
                          <td
                            className={cn(
                              'px-2 py-1.5 font-semibold tabular-nums',
                              mock.attendance >= 95
                                ? 'text-emerald-700'
                                : mock.attendance >= 90
                                  ? 'text-amber-700'
                                  : 'text-rose-700',
                            )}
                          >
                            {mock.attendance}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </QueryState>
        </section>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-[11px]"
          onClick={() => setReassignOpen(true)}
        >
          Reassign Master
        </Button>
        <Button type="button" variant="outline" size="sm" className="text-[11px]" disabled>
          Print Register
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-teal-700 text-[11px] hover:bg-teal-800"
          asChild
        >
          <Link href={`/admin/classes/${schoolClass.id}`}>
            <ExternalLink className="size-3.5" />
            Open
          </Link>
        </Button>
      </div>
      {onClose ? (
        <button
          type="button"
          className="sr-only"
          onClick={onClose}
        >
          Close panel
        </button>
      ) : null}
    </aside>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-2 text-center">
      <p className="font-heading text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
