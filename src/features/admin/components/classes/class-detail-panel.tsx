'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  MoreVertical,
  Printer,
  UserRound,
  X,
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
import type { SchoolClass, Subject } from '../../api/structure';
import { useAllocations } from '../../hooks/use-academics';
import { useUpdateClass } from '../../hooks/use-structure';
import { useStudents } from '../../hooks/use-students';
import { QueryState } from '../../lib/shared';
import { fullName, type StaffRow } from '../../types';

export function ClassDetailPanel({
  schoolClass,
  staff,
  subjects = [],
  invalidateKey,
  onClose,
}: {
  schoolClass: SchoolClass;
  staff: StaffRow[];
  subjects?: Subject[];
  invalidateKey: string;
  onClose?: () => void;
}) {
  const roster = useStudents(
    { classId: String(schoolClass.id), page: 1 },
    true,
  );
  const allocations = useAllocations({
    classId: String(schoolClass.id),
    sessionId: String(schoolClass.sessionId),
    page: 1,
  });
  const update = useUpdateClass(invalidateKey);
  const [reassignOpen, setReassignOpen] = useState(false);

  const formTutor = useMemo(() => {
    if (!schoolClass.formTeacherStaffId) return null;
    return staff.find((s) => s.id === schoolClass.formTeacherStaffId) ?? null;
  }, [schoolClass.formTeacherStaffId, staff]);

  const students = roster.data?.data ?? [];
  const totalStudents =
    schoolClass.studentCount ?? roster.data?.meta.total ?? students.length;
  const genderCounts = useMemo(() => {
    let male = 0;
    let female = 0;
    for (const s of students) {
      const code = (s.genderCode ?? s.gender ?? '').toLowerCase();
      if (code === 'male') male += 1;
      else if (code === 'female') female += 1;
    }
    return { male, female };
  }, [students]);

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
             {onClose ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Close inspection"
                  onClick={onClose}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2">
          <StatChip label="Enrolled" value={totalStudents} />
          <StatChip label="Male" value={genderCounts.male} />
          <StatChip label="Female" value={genderCounts.female} />
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
                {formTutor.jobTitle || formTutor.jobTitleCode ? (
                  <p className="text-xs text-muted-foreground">
                    {formTutor.jobTitle ?? formTutor.jobTitleCode}
                  </p>
                ) : null}
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
              Subjects
            </h3>
            <Link
              href={`/admin/allocations?classId=${schoolClass.id}`}
              className="text-[11px] font-semibold text-teal-700 hover:underline"
            >
              Manage
            </Link>
          </div>
          <QueryState
            isPending={allocations.isPending}
            error={allocations.error}
            onRetry={() => void allocations.refetch()}
          >
            {(allocations.data?.data ?? []).length === 0 ? (
              <EmptyState
                title="No subjects allocated"
                description="No subjects allocated to this class yet."
                className="py-6"
              />
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border">
                {(allocations.data?.data ?? []).map((a) => {
                  const subject =
                    a.subjectName ??
                    subjects.find((s) => s.id === a.subjectId)?.name ??
                    `Subject ${a.subjectId}`;
                  const teacherRow = a.staffId
                    ? staff.find((s) => s.id === a.staffId)
                    : undefined;
                  const teacher =
                    a.staffName ??
                    (teacherRow
                      ? fullName(
                          teacherRow.firstName,
                          teacherRow.lastName,
                          teacherRow.middleName,
                        )
                      : a.staffId
                        ? `Staff #${a.staffId}`
                        : 'Unassigned');
                  return (
                    <li key={a.id ?? `${a.subjectId}-${a.staffId}`} className="px-3 py-2 text-sm">
                      <p className="font-semibold">{subject}</p>
                      <p className="text-xs text-muted-foreground">{teacher}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </QueryState>
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
              <EmptyState title="No students enrolled" description="" className="py-6" />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-2 py-1.5 font-semibold">#</th>
                      <th className="px-2 py-1.5 font-semibold">Student</th>
                      <th className="px-2 py-1.5 font-semibold">Number</th>
                      <th className="px-2 py-1.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 8).map((s, i) => {
                      const name = fullName(s.firstName, s.lastName, s.middleName);
                      const status = s.statusCode ?? s.status ?? 'active';
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
                          <td className="px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
                            {s.studentNumber}
                          </td>
                          <td className="px-2 py-1.5">
                            <Badge
                              variant={status === 'active' ? 'successSoft' : 'warning'}
                              size="sm"
                            >
                              {status}
                            </Badge>
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
