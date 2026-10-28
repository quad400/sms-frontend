'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Pencil,
  Phone,
  UserRound,
  Wallet,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/patterns/status-badge';
import { PermissionGate } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { asRecord, str } from '@/lib/utils/record';
import { StudentAccountPanel } from '../fees-pages';
import {
  useStudent,
  useStudentEnrolments,
  useStudentGuardians,
} from '../../hooks/use-students';
import { GENDER_CODES, labelForCode } from '../../lib/codes';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { ageFromDob, avatarTone, initials } from './utils';

type SheetTab = 'overview' | 'guardians' | 'fees';

const TABS = [
  { id: 'overview' as const, label: 'Overview', permission: 'students.student.read' },
  { id: 'guardians' as const, label: 'Guardians', permission: 'students.guardian.list' },
  { id: 'fees' as const, label: 'Fees', permission: 'fees.account.read' },
];

export function StudentDetailSheet({
  studentId,
  open,
  onOpenChange,
}: {
  studentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<SheetTab>('overview');
  const id = studentId ?? 0;
  const student = useStudent(studentId, open && studentId != null);
  const guardians = useStudentGuardians(
    id,
    open && studentId != null && (tab === 'overview' || tab === 'guardians'),
  );
  const enrolments = useStudentEnrolments(
    id,
    open && studentId != null && tab === 'overview',
  );

  const s = student.data;
  const status = s?.statusCode ?? s?.status ?? 'active';
  const age = ageFromDob(s?.dateOfBirth);
  const gender = labelForCode(GENDER_CODES, s?.genderCode ?? s?.gender);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setTab('overview');
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg lg:max-w-xl"
      >
        <QueryState
          isPending={student.isPending}
          error={student.error}
          onRetry={() => void student.refetch()}
        >
          {!s ? (
            <p className="p-6 pt-10 text-sm text-muted-foreground">Student not available.</p>
          ) : (
            <>
              <div className="relative overflow-hidden border-b border-border bg-[linear-gradient(160deg,rgba(15,118,110,0.08),transparent_55%)] px-6 pb-5 pt-6">
                <SheetHeader className="pr-10">
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        'flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ring-1 ring-black/5',
                        avatarTone(s.genderCode ?? s.gender),
                      )}
                    >
                      {initials(s.firstName, s.lastName)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <SheetTitle className="truncate font-heading text-xl tracking-tight">
                          {fullName(s.firstName, s.lastName, s.middleName)}
                        </SheetTitle>
                        <SheetDescription className="mt-0.5 font-mono text-xs tracking-wide">
                          {s.studentNumber}
                        </SheetDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={status} />
                        {s.className ? (
                          <MetaChip>{s.className}</MetaChip>
                        ) : null}
                        {s.houseName ? (
                          <MetaChip className="bg-teal-50 text-teal-800">{s.houseName}</MetaChip>
                        ) : null}
                        {age != null ? <MetaChip>{age} yrs</MetaChip> : null}
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-4 flex flex-wrap gap-2">
                  <PermissionGate permission="students.student.update">
                    <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                      <Link href={`/admin/students/${id}/edit`}>
                        <Pencil className="size-3.5" />
                        Edit info
                      </Link>
                    </Button>
                  </PermissionGate>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/students/${id}`}>
                      <ExternalLink className="size-3.5" />
                      Full profile
                    </Link>
                  </Button>
                </div>
              </div>

              <nav
                className="sticky top-0 z-10 flex gap-1 border-b border-border bg-card/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-card/80"
                aria-label="Student sections"
              >
                {TABS.map((t) => (
                  <PermissionGate key={t.id} permission={t.permission}>
                    <button
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                        tab === t.id
                          ? 'bg-teal-700 text-white'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {t.label}
                    </button>
                  </PermissionGate>
                ))}
              </nav>

              <div className="flex flex-1 flex-col gap-4 px-6 py-5">
                {tab === 'overview' ? (
                  <>
                    <Panel title="Profile" icon={UserRound}>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <Fact label="Gender" value={gender} />
                        <Fact label="Date of birth" value={formatDate(s.dateOfBirth)} />
                        <Fact label="Class" value={s.className} />
                        <Fact label="House" value={s.houseName} />
                        <Fact
                          label="Primary contact"
                          value={s.primaryGuardianName}
                          hint={s.primaryGuardianPhone}
                          className="col-span-2"
                        />
                      </dl>
                    </Panel>

                    <Panel title="Enrolment" icon={BookOpen}>
                      <EnrolmentPreview data={enrolments.data} />
                    </Panel>

                    <Panel
                      title="Guardians"
                      icon={UserRound}
                      action={
                        <button
                          type="button"
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-teal-700 hover:underline"
                          onClick={() => setTab('guardians')}
                        >
                          View all
                          <ChevronRight className="size-3.5" />
                        </button>
                      }
                    >
                      <GuardianList data={guardians.data} limit={3} />
                    </Panel>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <QuickLink
                        href={`/admin/students/${id}/attendance`}
                        icon={CalendarDays}
                        label="Attendance"
                        hint="Records & marks"
                      />
                      <QuickLink
                        href={`/admin/students/${id}/results`}
                        icon={BookOpen}
                        label="Results"
                        hint="Assessments"
                      />
                    </div>
                  </>
                ) : null}

                {tab === 'guardians' ? (
                  <Panel title="Guardians & contacts" icon={UserRound}>
                    <GuardianList data={guardians.data} detailed />
                  </Panel>
                ) : null}

                {tab === 'fees' ? (
                  <Panel title="Tuition & fees" icon={Wallet}>
                    <StudentAccountPanel studentId={id} />
                  </Panel>
                ) : null}
              </div>
            </>
          )}
        </QueryState>
      </SheetContent>
    </Sheet>
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
        'rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon className="size-3.5" />
          </span>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value?: string | null;
  hint?: string | null;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value || '—'}</dd>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof CalendarDays;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition hover:border-teal-200 hover:bg-teal-50/40"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-teal-100 group-hover:text-teal-800">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground transition group-hover:text-teal-700" />
    </Link>
  );
}

function GuardianList({
  data,
  detailed,
  limit,
}: {
  data: unknown;
  detailed?: boolean;
  limit?: number;
}) {
  const rows = Array.isArray(data) ? data : (asRecord(data)?.data as unknown[] | undefined);
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No guardians linked.</p>;
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className="divide-y divide-border">
      {shown.map((g, i) => {
        const r = asRecord(g) ?? {};
        const gid = typeof r.id === 'number' ? r.id : i;
        const first = str(r.firstName);
        const last = str(r.lastName);
        const name = [first, last].filter(Boolean).join(' ') || 'Guardian';
        const phone = str(r.phone);
        const email = str(r.email);
        return (
          <li key={gid} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {initials(first, last)}
            </span>
            <div className="min-w-0 flex-1">
              {detailed && typeof r.id === 'number' ? (
                <Link
                  className="truncate text-sm font-semibold text-foreground hover:text-teal-700 hover:underline"
                  href={`/admin/guardians/${r.id}`}
                >
                  {name}
                </Link>
              ) : (
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              )}
              {detailed && email ? (
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              ) : null}
            </div>
            {phone ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" />
                {phone}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function EnrolmentPreview({ data }: { data: unknown }) {
  const rows = Array.isArray(data) ? data : (asRecord(data)?.data as unknown[] | undefined);
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No enrolments.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.slice(0, 4).map((e, i) => {
        const r = asRecord(e) ?? {};
        const status = str(r.status) || str(r.statusCode);
        return (
          <li
            key={typeof r.id === 'number' ? r.id : i}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="font-medium">
              {str(r.className) || `Class ${String(r.classId ?? '—')}`}
            </span>
            {status ? <StatusBadge status={status} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
