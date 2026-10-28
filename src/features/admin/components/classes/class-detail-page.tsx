'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Printer,
  School,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils/cn';
import { useAllocations } from '../../hooks/use-academics';
import { useStaffList, useStaffMember } from '../../hooks/use-staff';
import {
  useClass,
  useDeleteClass,
  useUpdateClass,
} from '../../hooks/use-structure';
import { useStudents } from '../../hooks/use-students';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import {
  classExtraForId,
  genderSplit,
  rosterExtraForIndex,
} from './ui-mock';

export function ClassDetailPage({ classId }: { classId: number }) {
  const router = useRouter();
  const schoolClass = useClass(classId);
  const allocations = useAllocations({ classId: String(classId), page: 1 }, true);
  const roster = useStudents({ classId: String(classId), page: 1 }, true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const removeMutation = useDeleteClass();

  const c = schoolClass.data;
  const invalidateKey = c
    ? `${c.campusId}-${c.sessionId}`
    : undefined;
  const update = useUpdateClass(invalidateKey);

  const staffList = useStaffList(
    { campusId: c?.campusId != null ? String(c.campusId) : undefined, status: 'active', page: 1 },
    c != null,
  );
  const formTutorQuery = useStaffMember(
    c?.formTeacherStaffId,
    c?.formTeacherStaffId != null,
  );

  const extra = c ? classExtraForId(c.id) : null;
  const students = roster.data?.data ?? [];
  const totalStudents =
    c?.studentCount ?? roster.data?.meta.total ?? students.length;
  const split = genderSplit(totalStudents || extra?.enrolled || 0);
  const enrolled = c?.studentCount ?? extra?.enrolled ?? totalStudents;
  const capacity = extra?.capacity ?? 40;
  const over = enrolled > capacity;

  const formTutor =
    formTutorQuery.data ??
    (c?.formTeacherStaffId
      ? (staffList.data?.data ?? []).find((s) => s.id === c.formTeacherStaffId)
      : null) ??
    null;

  const armLabel =
    c?.armName ?? c?.name?.split(/\s+/).pop() ?? '—';

  const teacherRows = useMemo(
    () => allocations.data?.data ?? [],
    [allocations.data?.data],
  );

  const assignTutor = (staffId: string) => {
    update.mutate(
      {
        id: classId,
        body: {
          formTeacherStaffId: staffId === 'none' ? null : Number(staffId),
        },
      },
      {
        onSuccess: () => {
          toastSuccess('Form tutor updated');
          setReassignOpen(false);
          void schoolClass.refetch();
        },
        onError: (e) => toastError('Could not update form tutor', e.message),
      },
    );
  };

  const remove = {
    isPending: removeMutation.isPending,
    mutate: () =>
      removeMutation.mutate(classId, {
        onSuccess: () => {
          toastSuccess('Class deleted');
          setDeleteOpen(false);
          router.push('/admin/classes');
        },
        onError: (e) => toastError('Could not delete', e.message),
      }),
  };

  return (
    <div className="space-y-5">
      <Link
        href="/admin/classes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Back to Class Management
      </Link>

      <QueryState
        isPending={schoolClass.isPending}
        error={schoolClass.error}
        onRetry={() => void schoolClass.refetch()}
      >
        {!c || !extra ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center shadow-[var(--shadow-card)]">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <School className="size-5" />
            </span>
            <p className="font-heading text-base font-semibold">Class not available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This arm may have been removed or you may not have access.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/admin/classes">Back to directory</Link>
            </Button>
          </div>
        ) : (
          <>
            <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="bg-[linear-gradient(160deg,rgba(15,118,110,0.1),transparent_55%)] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 font-heading text-xl font-bold text-teal-800 shadow-sm ring-1 ring-black/5">
                      {armLabel}
                    </span>
                    <div className="min-w-0 space-y-2">
                      <div>
                        <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
                          {c.name}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {[c.levelName, c.armName ? `Arm ${c.armName}` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="successSoft" size="sm">
                          Active Stream
                        </Badge>
                        <Badge variant={extra.division.variant} size="sm">
                          {extra.division.label}
                        </Badge>
                        <MetaChip>
                          <DoorOpen className="size-3" />
                          {extra.homeroom}
                        </MetaChip>
                        <MetaChip
                          className={
                            over
                              ? 'bg-rose-50 text-rose-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }
                        >
                          <Users className="size-3" />
                          {enrolled} / {capacity} enrolled
                        </MetaChip>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/timetables?classId=${classId}`}>
                        <CalendarDays className="size-3.5" />
                        Timetable
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/attendance?classId=${classId}`}>
                        <ClipboardList className="size-3.5" />
                        Attendance
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/allocations?classId=${classId}`}>
                        <BookOpen className="size-3.5" />
                        Teachers
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      <Printer className="size-3.5" />
                      Print Register
                    </Button>
                    <PermissionGate permission="school-structure.class.delete">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Boys" value={split.boys} />
              <StatCard label="Girls" value={split.girls} />
              <StatCard label="Boarders" value={split.boarders} />
              <StatCard label="Day Scholars" value={split.dayScholars} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <UserRound className="size-3.5" />
                    </span>
                    Form Tutor
                  </h2>
                  <Badge variant="soft" size="sm">
                    Form Master
                  </Badge>
                </div>

                {formTutor ? (
                  <div className="flex items-start gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-sm font-semibold text-teal-800">
                      {(formTutor.firstName?.[0] ?? '') +
                        (formTutor.lastName?.[0] ?? '')}
                    </span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold">
                        {fullName(
                          formTutor.firstName,
                          formTutor.lastName,
                          formTutor.middleName,
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formTutor.email || 'No email on file'}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {extra.department} · {extra.homeroom}
                      </p>
                      {formTutor.phone ? (
                        <p className="text-xs text-muted-foreground">{formTutor.phone}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 px-3 py-4 text-sm text-amber-900">
                    <UserRound className="size-4 shrink-0" />
                    No form tutor assigned for this arm.
                  </div>
                )}

                {reassignOpen ? (
                  <div className="mt-4 space-y-2">
                    <Select onValueChange={assignTutor} disabled={update.isPending}>
                      <SelectTrigger aria-label="Select form tutor">
                        <SelectValue placeholder="Select staff…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassign</SelectItem>
                        {(staffList.data?.data ?? []).map((s) => (
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
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setReassignOpen(true)}
                  >
                    Reassign Master
                  </Button>
                )}
              </section>

              <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <BookOpen className="size-3.5" />
                    </span>
                    Subject Teachers
                  </h2>
                  <Link
                    href={`/admin/allocations?classId=${classId}`}
                    className="text-xs font-semibold text-teal-700 hover:underline"
                  >
                    Edit matrix
                  </Link>
                </div>
                <QueryState
                  isPending={allocations.isPending}
                  error={allocations.error}
                  onRetry={() => void allocations.refetch()}
                >
                  {teacherRows.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
                      No subject teachers allocated yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border">
                      {teacherRows.slice(0, 6).map((row, i) => (
                        <li
                          key={row.id ?? `${row.subjectId}-${row.staffId}-${i}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0 truncate font-medium">
                            {row.subjectName ?? `Subject #${row.subjectId}`}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {row.staffName ?? `Staff #${row.staffId}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {teacherRows.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {teacherRows.length} subject teacher
                      {teacherRows.length === 1 ? '' : 's'} assigned
                    </p>
                  ) : null}
                </QueryState>
              </section>
            </div>

            <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading text-lg font-semibold tracking-tight">
                    Class Roster
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Enrolled students for this arm · Prefect {extra.prefect}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/students?classId=${classId}`}>
                    View in directory
                  </Link>
                </Button>
              </div>

              <QueryState
                isPending={roster.isPending}
                error={roster.error}
                onRetry={() => void roster.refetch()}
              >
                {students.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                    No students enrolled yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="px-3 py-2.5 font-semibold">Roll #</th>
                          <th className="px-3 py-2.5 font-semibold">Student</th>
                          <th className="px-3 py-2.5 font-semibold">RFID Scan</th>
                          <th className="px-3 py-2.5 font-semibold">Term GPA</th>
                          <th className="px-3 py-2.5 font-semibold">Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => {
                          const mock = rosterExtraForIndex(i);
                          const name = fullName(
                            s.firstName,
                            s.lastName,
                            s.middleName,
                          );
                          return (
                            <tr
                              key={s.id}
                              className="border-b border-border/70 last:border-0 hover:bg-muted/30"
                            >
                              <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                                #{String(i + 1).padStart(2, '0')}
                              </td>
                              <td className="px-3 py-2.5">
                                <Link
                                  href={`/admin/students/${s.id}`}
                                  className="font-semibold hover:text-teal-700 hover:underline"
                                >
                                  {name}
                                </Link>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  {s.studentNumber}
                                  {i === 0 ? ' · Prefect · Boarder' : ''}
                                </p>
                              </td>
                              <td className="px-3 py-2.5">
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
                              <td className="px-3 py-2.5 tabular-nums font-medium">
                                {mock.gpa}
                              </td>
                              <td
                                className={cn(
                                  'px-3 py-2.5 font-semibold tabular-nums',
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
          </>
        )}
      </QueryState>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete class?"
        description="This fails if the class still has enrolments. Reassign students first."
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}

function MetaChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)]">
      <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
