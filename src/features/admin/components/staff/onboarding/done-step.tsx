'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Phone,
  Plus,
  UserRound,
  Users,
} from 'lucide-react';
import { Fact } from '@/components/patterns/fact';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { formatDisplayDate } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';
import { asRecord, str } from '@/lib/utils/record';
import { useStaffAllocations } from '../../../hooks/use-staff';
import { useCampuses, useClasses, useSubjects } from '../../../hooks/use-structure';
import { GENDER_CODES, JOB_TITLE_CODES, labelForCode } from '../../../lib/codes';
import { QueryState } from '../../../lib/shared';
import { fullName, type StaffRow } from '../../../types';
import { avatarTone, initials } from '../utils';

export function DoneStep({
  staff,
  mode = 'create',
  onOnboardAnother,
}: {
  staff: StaffRow;
  mode?: 'create' | 'edit';
  onOnboardAnother: () => void;
}) {
  const status = staff.statusCode ?? staff.status ?? 'active';
  const isEdit = mode === 'edit';
  const campusKey = staff.campusId != null ? String(staff.campusId) : undefined;

  const campuses = useCampuses();
  const allocations = useStaffAllocations(staff.id);
  const classes = useClasses({ campusId: campusKey, key: campusKey ?? 'none' });
  const subjects = useSubjects();

  const campusName = useMemo(() => {
    if (staff.campusId == null) return null;
    return (
      campuses.data?.find((c) => c.id === staff.campusId)?.name ??
      `Campus #${staff.campusId}`
    );
  }, [campuses.data, staff.campusId]);

  const job =
    staff.jobTitleName ||
    labelForCode(JOB_TITLE_CODES, staff.jobTitleCode ?? staff.jobTitle) ||
    staff.jobTitle;
  const gender = labelForCode(GENDER_CODES, staff.genderCode ?? staff.gender);
  const hireDate = formatDisplayDate(staff.hireDate) || null;

  const classNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of classes.data ?? []) map.set(row.id, row.name);
    return map;
  }, [classes.data]);

  const subjectNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of subjects.data ?? []) map.set(row.id, row.name);
    return map;
  }, [subjects.data]);

  const allocationRows = useMemo(() => {
    const raw = allocations.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(asRecord(raw)?.data)
        ? (asRecord(raw)!.data as unknown[])
        : [];
    return list.map((item, index) => {
      const r = asRecord(item) ?? {};
      const classId = typeof r.classId === 'number' ? r.classId : null;
      const subjectId = typeof r.subjectId === 'number' ? r.subjectId : null;
      return {
        key: typeof r.id === 'number' ? r.id : index,
        classLabel:
          str(r.className) ||
          (classId != null ? classNameById.get(classId) ?? `Class #${classId}` : '—'),
        subjectLabel:
          str(r.subjectName) ||
          (subjectId != null
            ? subjectNameById.get(subjectId) ?? `Subject #${subjectId}`
            : '—'),
      };
    });
  }, [allocations.data, classNameById, subjectNameById]);

  const relatedPending =
    campuses.isPending ||
    allocations.isPending ||
    (allocationRows.length > 0 && (classes.isPending || subjects.isPending));
  const relatedError = campuses.error ?? allocations.error ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight">
          {isEdit ? 'Staff updated' : 'Staff onboarded'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEdit
            ? 'Review what was saved, then open the profile or return to the directory.'
            : 'Onboarding is complete. Review the record below, then open the profile or onboard another member.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 border-b border-border bg-[linear-gradient(160deg,color-mix(in_oklab,var(--academic)_10%,transparent),transparent_72%)] p-5 sm:flex-row sm:items-center">
          <span
            className={cn(
              'flex size-16 shrink-0 items-center justify-center rounded-2xl text-base font-semibold',
              avatarTone(staff.staffNumber ?? staff.genderCode ?? staff.firstName),
            )}
          >
            {initials(staff.firstName, staff.lastName)}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-heading text-lg font-semibold tracking-tight">
              {fullName(staff.firstName, staff.lastName, staff.middleName)}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {staff.staffNumber ?? `STA-${staff.id}`}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={status} />
              {job && job !== '—' ? (
                <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-teal-800">
                  {job}
                </span>
              ) : null}
              {campusName ? (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {campusName}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <QueryState
          isPending={relatedPending}
          error={relatedError}
          onRetry={() => {
            void campuses.refetch();
            void allocations.refetch();
          }}
        >
          <div className="grid gap-0 sm:grid-cols-2">
            <SummaryPanel title="Personal" icon={UserRound}>
              <Fact
                layout="inline"
                label="Full name"
                value={fullName(staff.firstName, staff.lastName, staff.middleName)}
              />
              <Fact layout="inline" label="Gender" value={gender !== '—' ? gender : null} />
              <Fact
                layout="inline"
                label="Role"
                value={job && job !== '—' ? job : null}
              />
              <Fact layout="inline" label="Campus" value={campusName} />
              <Fact layout="inline" label="Status" value={status} />
            </SummaryPanel>

            <SummaryPanel title="Contact & employment" icon={Phone}>
              <Fact layout="inline" label="Email" value={staff.email} />
              <Fact layout="inline" label="Phone" value={staff.phone} />
              <Fact layout="inline" label="Hire date" value={hireDate} />
              <Fact
                layout="inline"
                label="Login account"
                value={staff.userId != null ? 'Linked' : 'Not created'}
              />
            </SummaryPanel>

            <SummaryPanel title="Allocations" icon={BookOpen} className="sm:col-span-2">
              {allocationRows.length === 0 ? (
                <EmptyNote text="No teaching allocations recorded." />
              ) : (
                <ul className="space-y-2">
                  {allocationRows.map((row) => (
                    <li
                      key={row.key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 text-left text-sm"
                    >
                      <span className="font-semibold">{row.classLabel}</span>
                      <span className="text-xs text-muted-foreground">{row.subjectLabel}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SummaryPanel>
          </div>
        </QueryState>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-teal-700 hover:bg-teal-800">
          <Link href={`/admin/staff/${staff.id}`}>View profile</Link>
        </Button>
        {!isEdit ? (
          <Button type="button" variant="outline" onClick={onOnboardAnother}>
            <Plus className="size-4" />
            Onboard another
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href="/admin/staff">
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
