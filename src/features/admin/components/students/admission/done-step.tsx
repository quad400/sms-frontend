'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  HeartPulse,
  Plus,
  UserRound,
  Users,
} from 'lucide-react';
import { Fact } from '@/components/patterns/fact';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { formatDisplayDate } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';
import {
  useStudentEnrolments,
  useStudentGuardians,
  useStudentMedical,
} from '../../../hooks/use-students';
import { useCampuses, useClasses, useSessions } from '../../../hooks/use-structure';
import { GENDER_CODES, RELATIONSHIP_CODES, labelForCode } from '../../../lib/codes';
import { QueryState } from '../../../lib/shared';
import { fullName, type StudentRow } from '../../../types';
import { ageFromDob, avatarTone, initials } from '../utils';

export function DoneStep({
  student,
  mode = 'create',
  onAdmitAnother,
}: {
  student: StudentRow;
  mode?: 'create' | 'edit';
  onAdmitAnother: () => void;
}) {
  const status = student.statusCode ?? student.status ?? 'active';
  const isEdit = mode === 'edit';
  const campusKey =
    student.campusId != null ? String(student.campusId) : undefined;

  const guardians = useStudentGuardians(student.id);
  const enrolments = useStudentEnrolments(student.id);
  const medical = useStudentMedical(student.id);
  const campuses = useCampuses();
  const sessions = useSessions(campusKey);

  const campusName = useMemo(() => {
    if (student.campusId == null) return null;
    return (
      campuses.data?.find((c) => c.id === student.campusId)?.name ??
      `Campus #${student.campusId}`
    );
  }, [campuses.data, student.campusId]);

  const activeEnrolment = useMemo(() => {
    const rows = enrolments.data ?? [];
    return rows.find((e) => e.status === 'active') ?? rows[0] ?? null;
  }, [enrolments.data]);

  const classes = useClasses({
    campusId: campusKey,
    sessionId: activeEnrolment ? String(activeEnrolment.sessionId) : undefined,
    key: `${campusKey ?? ''}-${activeEnrolment?.sessionId ?? ''}`,
  });

  const sessionName = useMemo(() => {
    if (!activeEnrolment) return null;
    return (
      sessions.data?.find((s) => s.id === activeEnrolment.sessionId)?.name ??
      `Session #${activeEnrolment.sessionId}`
    );
  }, [activeEnrolment, sessions.data]);

  const className = useMemo(() => {
    if (!activeEnrolment) return student.className ?? null;
    return (
      classes.data?.find((c) => c.id === activeEnrolment.classId)?.name ??
      student.className ??
      `Class #${activeEnrolment.classId}`
    );
  }, [activeEnrolment, classes.data, student.className]);

  const gender = labelForCode(GENDER_CODES, student.genderCode ?? student.gender);
  const age = ageFromDob(student.dateOfBirth);
  const dob = formatDisplayDate(student.dateOfBirth) || null;

  const medicalRows = useMemo(() => {
    const m = medical.data;
    if (!m) return [];
    return [
      { label: 'Allergies', value: m.allergies },
      { label: 'Conditions', value: m.conditions },
      { label: 'Medications', value: m.medications },
      { label: 'Emergency notes', value: m.emergencyNotes },
    ].filter((r) => r.value && r.value.trim());
  }, [medical.data]);

  const relatedPending =
    guardians.isPending ||
    enrolments.isPending ||
    medical.isPending ||
    campuses.isPending ||
    (activeEnrolment != null && (sessions.isPending || classes.isPending));

  const relatedError =
    guardians.error ??
    enrolments.error ??
    medical.error ??
    campuses.error ??
    null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight">
          {isEdit ? 'Student updated' : 'Student admitted'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? 'Review what was saved, then open the profile or return to the directory.'
            : 'Admission is complete. Review the record below, then open the profile or admit another student.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 border-b border-border bg-[linear-gradient(160deg,color-mix(in_oklab,var(--academic)_10%,transparent),transparent_72%)] p-5 sm:flex-row sm:items-center">
          <span
            className={cn(
              'flex size-16 shrink-0 items-center justify-center rounded-2xl text-base font-semibold',
              avatarTone(student.genderCode ?? student.gender),
            )}
          >
            {initials(student.firstName, student.lastName)}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-heading text-lg font-semibold tracking-tight">
              {fullName(student.firstName, student.lastName, student.middleName)}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {student.studentNumber}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={status} />
              {className ? (
                <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-800">
                  {className}
                </span>
              ) : null}
              {sessionName ? (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {sessionName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <QueryState
          isPending={relatedPending}
          error={relatedError}
          onRetry={() => {
            void guardians.refetch();
            void enrolments.refetch();
            void medical.refetch();
          }}
        >
          <div className="grid gap-0 sm:grid-cols-2">
            <SummaryPanel title="Personal" icon={UserRound}>
              <Fact layout="inline" label="Full name" value={fullName(student.firstName, student.lastName, student.middleName)} />
              <Fact layout="inline" label="Gender" value={gender !== '—' ? gender : null} />
              <Fact
                layout="inline"
                label="Date of birth"
                value={
                  dob
                    ? `${dob}${age != null ? ` · ${age} yrs` : ''}`
                    : null
                }
              />
              <Fact layout="inline" label="Campus" value={campusName} />
              <Fact layout="inline" label="Status" value={status} />
            </SummaryPanel>

            <SummaryPanel title="Enrolment" icon={BookOpen}>
              {activeEnrolment ? (
                <>
                  <Fact layout="inline" label="Session" value={sessionName} />
                  <Fact layout="inline" label="Class" value={className} />
                  <Fact
                    layout="inline"
                    label="Enrolled"
                    value={formatDisplayDate(activeEnrolment.enrolledAt) || null}
                  />
                  <Fact layout="inline" label="Enrolment status" value={activeEnrolment.status} />
                </>
              ) : (
                <EmptyNote text="No class enrolment recorded." />
              )}
            </SummaryPanel>

            <SummaryPanel title="Guardians" icon={Users} className="sm:col-span-2">
              {(guardians.data ?? []).length === 0 ? (
                <EmptyNote text="No guardians linked." />
              ) : (
                <ul className="space-y-2">
                  {(guardians.data ?? []).map((g) => (
                    <li
                      key={g.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {fullName(g.firstName, g.lastName)}
                          {g.isPrimaryContact ? (
                            <span className="ml-1.5 text-[11px] font-semibold text-teal-700">
                              Primary
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[
                            labelForCode(RELATIONSHIP_CODES, g.relationship),
                            g.phone,
                            g.email,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {g.address ? (
                          <p className="mt-1 text-xs text-muted-foreground">{g.address}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {g.canPickUp ? <Chip>Can pick up</Chip> : null}
                        {g.isFeePayer ? <Chip>Fee payer</Chip> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SummaryPanel>

            <SummaryPanel title="Medical" icon={HeartPulse} className="sm:col-span-2">
              {medicalRows.length === 0 ? (
                <EmptyNote text="No medical notes recorded." />
              ) : (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {medicalRows.map((row) => (
                    <div key={row.label} className="text-left">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </SummaryPanel>
          </div>
        </QueryState>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-teal-700 hover:bg-teal-800">
          <Link href={`/admin/students/${student.id}`}>View profile</Link>
        </Button>
        {!isEdit ? (
          <Button type="button" variant="outline" onClick={onAdmitAnother}>
            <Plus className="size-4" />
            Admit another
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href="/admin/students">
            <Users className="size-4" />
            Directory
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryPanel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'space-y-3 border-b border-border p-5 last:border-b-0 sm:odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0',
        className,
      )}
    >
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}


function EmptyNote({ text }: { text: string }) {
  return <p className="text-left text-sm text-muted-foreground">{text}</p>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}
