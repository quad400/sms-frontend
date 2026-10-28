'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Pencil,
  Phone,
  ScrollText,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { ConfirmDialog, ReasonDialog } from '@/components/patterns/confirm-dialog';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { asRecord, str } from '@/lib/utils/record';
import {
  useArchiveStudent,
  useCreateTransfer,
  useStudent,
  useStudentEnrolments,
  useStudentGuardians,
} from '../hooks/use-students';
import { GENDER_CODES, TRANSFER_TYPE_CODES, labelForCode } from '../lib/codes';
import { QueryState } from '../lib/shared';
import { fullName } from '../types';
import { StudentAccountPanel } from './fees-pages';
import { ageFromDob, avatarTone, initials } from './students/utils';

const TABS = [
  { href: '', label: 'Overview', permission: 'students.student.read', icon: UserRound },
  { href: '/guardians', label: 'Guardians', permission: 'students.guardian.list', icon: Users },
  { href: '/enrolment', label: 'Enrolment', permission: 'students.enrolment.list', icon: BookOpen },
  { href: '/attendance', label: 'Attendance', permission: 'attendance.register.list', icon: CalendarDays },
  { href: '/results', label: 'Results', permission: 'assessment.result.list', icon: ClipboardList },
  { href: '/fees', label: 'Fees', permission: 'fees.account.read', icon: Wallet },
  { href: '/medical', label: 'Medical', permission: 'students.medical.read', icon: HeartPulse },
  { href: '/consents', label: 'Consents', permission: 'students.student.read', icon: FileText },
  { href: '/audit', label: 'Audit', permission: 'audit.log.list', icon: ScrollText },
] as const;

export function StudentProfile({
  studentId,
  tab = 'overview',
}: {
  studentId: number;
  tab?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferType, setTransferType] = useState('internal');
  const [transferDate, setTransferDate] = useState('');
  const [destination, setDestination] = useState('');

  const student = useStudent(studentId);
  const guardians = useStudentGuardians(studentId, tab === 'overview' || tab === 'guardians');
  const enrolments = useStudentEnrolments(studentId, tab === 'overview' || tab === 'enrolment');
  const archive = useArchiveStudent();
  const transfer = useCreateTransfer(studentId);

  const s = student.data;
  const status = s?.statusCode ?? s?.status ?? 'active';
  const archived = /archiv|inactive|withdrawn/i.test(status);
  const age = ageFromDob(s?.dateOfBirth);
  const gender = labelForCode(GENDER_CODES, s?.genderCode ?? s?.gender);

  return (
    <div className="space-y-5">
      <QueryState
        isPending={student.isPending}
        error={student.error}
        onRetry={() => void student.refetch()}
      >
        {!s ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center shadow-[var(--shadow-card)]">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound className="size-5" />
            </span>
            <p className="font-heading text-base font-semibold">Student not available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This record may have been removed or you may not have access.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/admin/students">Back to directory</Link>
            </Button>
          </div>
        ) : (
          <>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to directory
            </Link>

            <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="bg-[linear-gradient(160deg,rgba(15,118,110,0.1),transparent_55%)] px-5 py-5 sm:px-6">
                {archived ? (
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    This student is read-only ({status}).
                  </p>
                ) : null}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={cn(
                        'flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ring-1 ring-black/5',
                        avatarTone(s.genderCode ?? s.gender),
                      )}
                    >
                      {initials(s.firstName, s.lastName)}
                    </span>
                    <div className="min-w-0 space-y-2">
                      <div>
                        <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
                          {fullName(s.firstName, s.lastName, s.middleName)}
                        </h1>
                        <p className="mt-0.5 font-mono text-xs tracking-wide text-muted-foreground">
                          {s.studentNumber}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={status} />
                        {s.className ? <MetaChip>{s.className}</MetaChip> : null}
                        {s.houseName ? (
                          <MetaChip className="bg-teal-50 text-teal-800">{s.houseName}</MetaChip>
                        ) : null}
                        {age != null ? <MetaChip>{age} yrs</MetaChip> : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <PermissionGate permission="students.student.update">
                      <Button
                        asChild
                        size="sm"
                        disabled={archived}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        <Link href={`/admin/students/${studentId}/edit`}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Link>
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="students.transfer.create">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={archived}
                        onClick={() => setTransferOpen(true)}
                      >
                        <ArrowLeftRight className="size-3.5" />
                        Transfer
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="students.student.archive">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={archived}
                        className="text-danger hover:bg-danger/5 hover:text-danger"
                        onClick={() => setArchiveOpen(true)}
                      >
                        <Archive className="size-3.5" />
                        Archive
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </div>

              <nav
                className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2"
                aria-label="Student sections"
              >
                {TABS.map((t) => {
                  const href = `/admin/students/${studentId}${t.href}`;
                  const active =
                    t.href === ''
                      ? pathname === `/admin/students/${studentId}`
                      : pathname.startsWith(href);
                  const Icon = t.icon;
                  return (
                    <PermissionGate key={t.href || 'overview'} permission={t.permission}>
                      <Link
                        href={href}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'bg-teal-700 text-white'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <Icon className="size-3.5" />
                        {t.label}
                      </Link>
                    </PermissionGate>
                  );
                })}
              </nav>
            </header>

            {tab === 'overview' ? (
              <div className="grid gap-4 lg:grid-cols-5">
                <Panel title="Profile" icon={UserRound} className="lg:col-span-3">
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Fact label="Gender" value={gender} />
                    <Fact label="Date of birth" value={formatDate(s.dateOfBirth)} />
                    <Fact label="Class" value={s.className} />
                    <Fact label="House" value={s.houseName} />
                    <Fact
                      label="Campus"
                      value={s.campusId != null ? String(s.campusId) : null}
                    />
                    <Fact
                      label="Primary contact"
                      value={s.primaryGuardianName}
                      hint={s.primaryGuardianPhone}
                    />
                  </dl>
                </Panel>
                <div className="space-y-4 lg:col-span-2">
                  <Panel title="Guardians" icon={Users}>
                    <GuardianPreview data={guardians.data} limit={4} />
                    <Link
                      href={`/admin/students/${studentId}/guardians`}
                      className="mt-3 inline-block text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View all guardians
                    </Link>
                  </Panel>
                  <Panel title="Enrolment" icon={BookOpen}>
                    <EnrolmentList data={enrolments.data} limit={3} />
                  </Panel>
                </div>
              </div>
            ) : null}

            {tab === 'guardians' ? (
              <Panel title="Guardians & contacts" icon={Users}>
                <GuardianPreview data={guardians.data} detailed />
              </Panel>
            ) : null}

            {tab === 'enrolment' ? (
              <Panel title="Enrolment history" icon={BookOpen}>
                <EnrolmentList data={enrolments.data} />
              </Panel>
            ) : null}

            {tab === 'fees' ? (
              <Panel title="Tuition & fees" icon={Wallet}>
                <StudentAccountPanel studentId={studentId} />
              </Panel>
            ) : null}

            {['attendance', 'results', 'medical', 'consents', 'audit'].includes(tab) ? (
              <Panel
                title={tab.charAt(0).toUpperCase() + tab.slice(1)}
                icon={TABS.find((t) => t.href === `/${tab}`)?.icon ?? FileText}
              >
                {tab === 'medical' ? (
                  <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Access to medical details is logged for compliance.
                  </p>
                ) : null}
                <EmptyTabHint tab={tab} />
              </Panel>
            ) : null}
          </>
        )}
      </QueryState>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive student?"
        confirmLabel="Archive"
        destructive
        isPending={archive.isPending}
        onConfirm={() =>
          archive.mutate(studentId, {
            onSuccess: () => {
              toastSuccess('Student archived');
              router.push('/admin/students');
            },
            onError: (e) => toastError('Could not archive', e.message),
          })
        }
      />
      <ReasonDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        title="Transfer student"
        confirmLabel="Record transfer"
        isPending={transfer.isPending}
        onConfirm={(reason) =>
          transfer.mutate(
            {
              typeCode: transferType,
              effectiveDate: transferDate || new Date().toISOString().slice(0, 10),
              destinationSchool: destination || undefined,
              reason,
            },
            {
              onSuccess: () => {
                toastSuccess('Transfer recorded');
                setTransferOpen(false);
              },
              onError: (e) => toastError('Could not transfer', e.message),
            },
          )
        }
      >
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Select value={transferType} onValueChange={setTransferType}>
              <SelectTrigger aria-label="Transfer type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_TYPE_CODES.map((t) => (
                  <SelectItem key={t.code} value={t.code}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Effective date</Label>
            <DatePicker
              value={transferDate}
              onChange={setTransferDate}
              placeholder="Select effective date"
              aria-label="Effective date"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="School or campus"
            />
          </div>
        </div>
      </ReasonDialog>
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
  className,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string | null;
  hint?: string | null;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value || '—'}</dd>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function EmptyTabHint({ tab }: { tab: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">Nothing to show yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {tab === 'attendance'
          ? 'Attendance registers for this student will appear here.'
          : tab === 'results'
            ? 'Assessment results will appear here once published.'
            : tab === 'medical'
              ? 'No medical notes have been recorded.'
              : tab === 'consents'
                ? 'Consent records will appear here when captured.'
                : 'Audit events for this student will appear here.'}
      </p>
    </div>
  );
}

function GuardianPreview({
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

function EnrolmentList({ data, limit }: { data: unknown; limit?: number }) {
  const rows = Array.isArray(data) ? data : (asRecord(data)?.data as unknown[] | undefined);
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No enrolments.</p>;
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className="space-y-2">
      {shown.map((e, i) => {
        const r = asRecord(e) ?? {};
        const status = str(r.status) || str(r.statusCode);
        return (
          <li
            key={typeof r.id === 'number' ? r.id : i}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
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
