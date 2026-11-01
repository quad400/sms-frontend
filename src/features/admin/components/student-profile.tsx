'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ScrollText,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import { ConfirmDialog, ReasonDialog } from '@/components/patterns/confirm-dialog';
import { EmptyState } from '@/components/patterns/empty-state';
import { Fact } from '@/components/patterns/fact';
import { MetaChip } from '@/components/patterns/meta-chip';
import { QuickLink } from '@/components/patterns/quick-link';
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
import {
  formatDisplayDate,
  formatDisplayDateOrDash,
  formatDisplayDateTime,
} from '@/lib/format/date';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { asRecord, str } from '@/lib/utils/record';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  listAuditLogs,
  listStudentConsents,
  type AuditLog,
} from '../api/platform';
import type {
  LinkedGuardian,
  StudentEnrolment,
  StudentMedicalInfo,
} from '../api/students';
import {
  useArchiveStudent,
  useCreateTransfer,
  useStudent,
  useStudentEnrolments,
  useStudentGuardians,
  useStudentMedical,
} from '../hooks/use-students';
import { useCampuses, useClasses, useSessions } from '../hooks/use-structure';
import {
  GENDER_CODES,
  RELATIONSHIP_CODES,
  TRANSFER_TYPE_CODES,
  labelForCode,
} from '../lib/codes';
import { QueryState } from '../lib/shared';
import { fullName } from '../types';
import { StudentAccountPanel } from './fees-pages';
import { ageFromDob, avatarTone, initials } from './students/utils';

const TABS = [
  { href: '', label: 'Overview', permission: 'students.student.read', icon: UserRound },
  {
    href: '/guardians',
    label: 'Guardians',
    permission: 'students.guardian.list',
    icon: Users,
  },
  {
    href: '/enrolment',
    label: 'Enrolment',
    permission: 'students.student.read',
    icon: BookOpen,
  },
  {
    href: '/attendance',
    label: 'Attendance',
    permission: 'attendance.register.list',
    icon: CalendarDays,
  },
  {
    href: '/results',
    label: 'Results',
    permission: 'assessment.result.list',
    icon: ClipboardList,
  },
  { href: '/fees', label: 'Fees', permission: 'fees.account.read', icon: Wallet },
  {
    href: '/medical',
    label: 'Medical',
    permission: 'students.medical.read',
    icon: HeartPulse,
  },
  {
    href: '/consents',
    label: 'Consents',
    permission: 'students.student.read',
    icon: FileText,
  },
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

  const loadRelated =
    tab === 'overview' ||
    tab === 'guardians' ||
    tab === 'enrolment' ||
    tab === 'medical';

  const student = useStudent(studentId);
  const guardians = useStudentGuardians(studentId, loadRelated || tab === 'guardians');
  const enrolments = useStudentEnrolments(studentId, loadRelated || tab === 'enrolment');
  const medical = useStudentMedical(studentId, tab === 'overview' || tab === 'medical');
  const archive = useArchiveStudent();
  const transfer = useCreateTransfer(studentId);

  const s = student.data;
  const status = s?.statusCode ?? s?.status ?? 'active';
  const archived = /archiv|inactive|withdrawn/i.test(status);
  const age = ageFromDob(s?.dateOfBirth);
  const gender = labelForCode(GENDER_CODES, s?.genderCode ?? s?.gender);
  const campusKey = s?.campusId != null ? String(s.campusId) : undefined;

  const campuses = useCampuses(Boolean(s));
  const sessions = useSessions(campusKey);
  const classes = useClasses({
    campusId: campusKey,
    key: campusKey ?? 'none',
  });

  const campusName = useMemo(() => {
    if (s?.campusId == null) return null;
    return (
      campuses.data?.find((c) => c.id === s.campusId)?.name ?? `Campus #${s.campusId}`
    );
  }, [campuses.data, s?.campusId]);

  const sessionNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const session of sessions.data ?? []) {
      map.set(session.id, session.name);
    }
    return map;
  }, [sessions.data]);

  const classNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of classes.data ?? []) {
      map.set(row.id, row.name);
    }
    return map;
  }, [classes.data]);

  const activeEnrolment = useMemo(() => {
    const rows = enrolments.data ?? [];
    return rows.find((e) => e.status === 'active') ?? rows[0] ?? null;
  }, [enrolments.data]);

  const dobLabel = useMemo(() => {
    const formatted = formatDisplayDate(s?.dateOfBirth);
    if (!formatted) return null;
    return age != null ? `${formatted} · ${age} yrs` : formatted;
  }, [age, s?.dateOfBirth]);

  return (
    <div className="space-y-5">
      <QueryState
        isPending={student.isPending}
        error={student.error}
        onRetry={() => void student.refetch()}
      >
        {!s ? (
          <EmptyState
            icon={UserRound}
            title="Student not available"
            description="This record may have been removed or you may not have access."
            className="bg-card shadow-[var(--shadow-card)]"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/students">Back to directory</Link>
              </Button>
            }
          />
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
                        {s.className ||
                        (activeEnrolment && classNameById.get(activeEnrolment.classId)) ? (
                          <MetaChip className="bg-teal-50 text-teal-800">
                            {s.className ||
                              classNameById.get(activeEnrolment!.classId) ||
                              `Class #${activeEnrolment!.classId}`}
                          </MetaChip>
                        ) : null}
                        {s.houseName ? (
                          <MetaChip className="bg-teal-50 text-teal-800">{s.houseName}</MetaChip>
                        ) : null}
                        {campusName ? <MetaChip>{campusName}</MetaChip> : null}
                        {age != null ? <MetaChip>{age} yrs</MetaChip> : null}
                      </div>
                      {(s.primaryGuardianName || s.primaryGuardianPhone) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {s.primaryGuardianName ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="size-3.5" aria-hidden />
                              {s.primaryGuardianName}
                            </span>
                          ) : null}
                          {s.primaryGuardianPhone ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="size-3.5" aria-hidden />
                              {s.primaryGuardianPhone}
                            </span>
                          ) : null}
                        </div>
                      )}
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
              <OverviewTab
                studentId={studentId}
                gender={gender}
                dobLabel={dobLabel}
                campusName={campusName}
                houseName={s.houseName}
                className={
                  s.className ||
                  (activeEnrolment
                    ? classNameById.get(activeEnrolment.classId) ?? null
                    : null)
                }
                status={status}
                studentNumber={s.studentNumber}
                firstName={s.firstName}
                middleName={s.middleName}
                lastName={s.lastName}
                primaryGuardianName={s.primaryGuardianName}
                primaryGuardianPhone={s.primaryGuardianPhone}
                guardians={guardians}
                enrolments={enrolments}
                medical={medical}
                activeEnrolment={activeEnrolment}
                sessionNameById={sessionNameById}
                classNameById={classNameById}
              />
            ) : null}

            {tab === 'guardians' ? (
              <Panel
                title="Guardians & contacts"
                icon={Users}
                action={
                  <Button asChild variant="outline" size="sm" disabled={archived}>
                    <Link href={`/admin/students/${studentId}/edit`}>
                      <Pencil className="size-3.5" />
                      Manage in edit
                    </Link>
                  </Button>
                }
              >
                <QueryState
                  isPending={guardians.isPending}
                  error={guardians.error}
                  onRetry={() => void guardians.refetch()}
                  loaderVariant="inline"
                >
                  <GuardianList rows={guardians.data ?? []} detailed />
                </QueryState>
              </Panel>
            ) : null}

            {tab === 'enrolment' ? (
              <Panel
                title="Enrolment history"
                icon={BookOpen}
                action={
                  <Button asChild variant="outline" size="sm" disabled={archived}>
                    <Link href={`/admin/students/${studentId}/edit`}>
                      <Pencil className="size-3.5" />
                      Manage in edit
                    </Link>
                  </Button>
                }
              >
                <QueryState
                  isPending={enrolments.isPending || sessions.isPending || classes.isPending}
                  error={enrolments.error ?? sessions.error ?? classes.error}
                  onRetry={() => {
                    void enrolments.refetch();
                    void sessions.refetch();
                    void classes.refetch();
                  }}
                  loaderVariant="inline"
                >
                  <EnrolmentList
                    rows={enrolments.data ?? []}
                    sessionNameById={sessionNameById}
                    classNameById={classNameById}
                    fallbackClassName={s.className}
                  />
                </QueryState>
              </Panel>
            ) : null}

            {tab === 'fees' ? (
              <Panel title="Tuition & fees" icon={Wallet}>
                <StudentAccountPanel studentId={studentId} />
              </Panel>
            ) : null}

            {tab === 'medical' ? (
              <Panel
                title="Medical information"
                icon={HeartPulse}
                action={
                  <Button asChild variant="outline" size="sm" disabled={archived}>
                    <Link href={`/admin/students/${studentId}/edit`}>
                      <Pencil className="size-3.5" />
                      Manage in edit
                    </Link>
                  </Button>
                }
              >
                <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Access to medical details is logged for compliance.
                </p>
                <QueryState
                  isPending={medical.isPending}
                  error={medical.error}
                  onRetry={() => void medical.refetch()}
                  loaderVariant="inline"
                >
                  <MedicalPanel data={medical.data} />
                </QueryState>
              </Panel>
            ) : null}

            {tab === 'consents' ? <ConsentsTab studentId={studentId} /> : null}

            {tab === 'audit' ? <AuditTab studentId={studentId} /> : null}

            {tab === 'attendance' || tab === 'results' ? (
              <Panel
                title={tab === 'attendance' ? 'Attendance' : 'Results'}
                icon={tab === 'attendance' ? CalendarDays : ClipboardList}
              >
                <EmptyState
                  title="Nothing to show yet"
                  description={
                    tab === 'attendance'
                      ? 'Attendance registers for this student will appear here.'
                      : 'Assessment results will appear here once published.'
                  }
                  className="bg-muted/30"
                />
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

function OverviewTab({
  studentId,
  gender,
  dobLabel,
  campusName,
  houseName,
  className,
  status,
  studentNumber,
  firstName,
  middleName,
  lastName,
  primaryGuardianName,
  primaryGuardianPhone,
  guardians,
  enrolments,
  medical,
  activeEnrolment,
  sessionNameById,
  classNameById,
}: {
  studentId: number;
  gender: string;
  dobLabel: string | null;
  campusName: string | null;
  houseName?: string | null;
  className?: string | null;
  status: string;
  studentNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  primaryGuardianName?: string | null;
  primaryGuardianPhone?: string | null;
  guardians: ReturnType<typeof useStudentGuardians>;
  enrolments: ReturnType<typeof useStudentEnrolments>;
  medical: ReturnType<typeof useStudentMedical>;
  activeEnrolment: StudentEnrolment | null;
  sessionNameById: Map<number, string>;
  classNameById: Map<number, string>;
}) {
  const relatedPending =
    guardians.isPending || enrolments.isPending || medical.isPending;
  const relatedError = guardians.error ?? enrolments.error ?? medical.error ?? null;

  const enrolmentClass =
    className ||
    (activeEnrolment
      ? classNameById.get(activeEnrolment.classId) ?? `Class #${activeEnrolment.classId}`
      : null);
  const enrolmentSession = activeEnrolment
    ? sessionNameById.get(activeEnrolment.sessionId) ??
      `Session #${activeEnrolment.sessionId}`
    : null;

  return (
    <div className="space-y-4">
      <QueryState
        isPending={relatedPending}
        error={relatedError}
        onRetry={() => {
          void guardians.refetch();
          void enrolments.refetch();
          void medical.refetch();
        }}
        loaderVariant="inline"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="grid gap-0 lg:grid-cols-2">
            <SummarySection title="Personal" icon={UserRound}>
              <Fact
                layout="inline"
                label="Full name"
                value={fullName(firstName, lastName, middleName)}
              />
              <Fact layout="inline" label="Student number" value={studentNumber} mono />
              <Fact layout="inline" label="Gender" value={gender !== '—' ? gender : null} />
              <Fact layout="inline" label="Date of birth" value={dobLabel} />
              <Fact layout="inline" label="Campus" value={campusName} />
              <Fact layout="inline" label="House" value={houseName} />
              <Fact layout="inline" label="Status" value={status} />
              <Fact
                layout="inline"
                label="Primary contact"
                value={primaryGuardianName}
                hint={primaryGuardianPhone}
              />
            </SummarySection>

            <SummarySection title="Current enrolment" icon={BookOpen}>
              {activeEnrolment ? (
                <>
                  <Fact layout="inline" label="Session" value={enrolmentSession} />
                  <Fact layout="inline" label="Class" value={enrolmentClass} />
                  <Fact
                    layout="inline"
                    label="Enrolled"
                    value={formatDisplayDate(activeEnrolment.enrolledAt) || null}
                  />
                  {activeEnrolment.endedAt ? (
                    <Fact
                      layout="inline"
                      label="Ended"
                      value={formatDisplayDate(activeEnrolment.endedAt) || null}
                    />
                  ) : null}
                  <Fact layout="inline" label="Enrolment status" value={activeEnrolment.status} />
                </>
              ) : (
                <EmptyNote text="No class enrolment recorded." />
              )}
              <SectionLink href={`/admin/students/${studentId}/enrolment`}>
                View enrolment history
              </SectionLink>
            </SummarySection>

            <SummarySection title="Guardians" icon={Users} className="lg:col-span-2">
              <GuardianList rows={guardians.data ?? []} limit={4} />
              <SectionLink href={`/admin/students/${studentId}/guardians`}>
                View all guardians
              </SectionLink>
            </SummarySection>

            <SummarySection title="Medical" icon={HeartPulse} className="lg:col-span-2">
              <MedicalPanel data={medical.data} compact />
              <SectionLink href={`/admin/students/${studentId}/medical`}>
                Open medical record
              </SectionLink>
            </SummarySection>
          </div>
        </div>
      </QueryState>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href={`/admin/students/${studentId}/attendance`}
          icon={CalendarDays}
          label="Attendance"
          hint="Registers & rates"
        />
        <QuickLink
          href={`/admin/students/${studentId}/results`}
          icon={ClipboardList}
          label="Results"
          hint="Assessments"
        />
        <QuickLink
          href={`/admin/students/${studentId}/fees`}
          icon={Wallet}
          label="Fees"
          hint="Account & invoices"
        />
        <QuickLink
          href={`/admin/students/${studentId}/consents`}
          icon={FileText}
          label="Consents"
          hint="Permissions on file"
        />
      </div>
    </div>
  );
}

function ConsentsTab({ studentId }: { studentId: number }) {
  const consents = useQuery<unknown, ApiClientError>({
    queryKey: [...adminKeys.student(studentId), 'consents'] as const,
    queryFn: () => listStudentConsents(studentId),
  });

  const rows = useMemo(() => {
    const raw = consents.data;
    if (Array.isArray(raw)) return raw;
    const record = asRecord(raw);
    if (Array.isArray(record?.data)) return record.data;
    return [];
  }, [consents.data]);

  return (
    <Panel title="Consents" icon={FileText}>
      <QueryState
        isPending={consents.isPending}
        error={consents.error}
        onRetry={() => void consents.refetch()}
        loaderVariant="inline"
      >
        {rows.length === 0 ? (
          <EmptyState
            title="No consents recorded"
            description="Consent records will appear here when captured."
            className="bg-muted/30"
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((item, index) => {
              const r = asRecord(item) ?? {};
              const id = typeof r.id === 'number' ? r.id : index;
              const type =
                str(r.type) ||
                str(r.typeCode) ||
                str(r.consentType) ||
                str(r.name) ||
                'Consent';
              const granted =
                r.granted === true ||
                r.accepted === true ||
                str(r.status).toLowerCase() === 'granted';
              const when =
                formatDisplayDateTime(r.recordedAt ?? r.createdAt ?? r.grantedAt) ||
                formatDisplayDate(r.recordedAt ?? r.createdAt ?? r.grantedAt);
              return (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{type}</p>
                    {when ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{when}</p>
                    ) : null}
                  </div>
                  <StatusBadge status={granted ? 'granted' : str(r.status) || 'recorded'} />
                </li>
              );
            })}
          </ul>
        )}
      </QueryState>
    </Panel>
  );
}

function AuditTab({ studentId }: { studentId: number }) {
  const audit = useQuery({
    queryKey: adminKeys.auditLogs({ targetType: 'student', studentId }),
    queryFn: async () => {
      const page = await listAuditLogs({ targetType: 'student' });
      const filtered = page.data.filter(
        (row) => String(row.targetId ?? '') === String(studentId),
      );
      return filtered;
    },
  });

  return (
    <Panel title="Audit trail" icon={ScrollText}>
      <QueryState
        isPending={audit.isPending}
        error={audit.error}
        onRetry={() => void audit.refetch()}
        loaderVariant="inline"
      >
        {(audit.data ?? []).length === 0 ? (
          <EmptyState
            title="No audit events yet"
            description="Actions on this student record will appear here."
            className="bg-muted/30"
          />
        ) : (
          <ul className="divide-y divide-border">
            {(audit.data as AuditLog[]).map((row) => (
              <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {row.summary || row.action || 'Event'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[row.actorName, row.action].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDisplayDateTime(row.createdAt) ||
                      formatDisplayDateOrDash(row.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </Panel>
  );
}

function GuardianList({
  rows,
  detailed,
  limit,
}: {
  rows: LinkedGuardian[];
  detailed?: boolean;
  limit?: number;
}) {
  if (rows.length === 0) {
    return <EmptyNote text="No guardians linked." />;
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className={cn(detailed ? 'space-y-3' : 'space-y-2')}>
      {shown.map((g) => {
        const name = fullName(g.firstName, g.lastName);
        const relationship = labelForCode(RELATIONSHIP_CODES, g.relationship);
        return (
          <li
            key={g.id}
            className={cn(
              'flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5',
              detailed && 'bg-muted/20',
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {initials(g.firstName, g.lastName)}
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">
                  {detailed ? (
                    <Link
                      href={`/admin/guardians/${g.id}`}
                      className="hover:text-teal-700 hover:underline"
                    >
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  {g.isPrimaryContact ? (
                    <span className="ml-1.5 text-[11px] font-semibold text-teal-700">
                      Primary
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[relationship !== '—' ? relationship : null, g.phone, g.email]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {detailed && g.occupation ? (
                  <p className="text-xs text-muted-foreground">{g.occupation}</p>
                ) : null}
                {detailed && g.address ? (
                  <p className="inline-flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    {g.address}
                  </p>
                ) : null}
                {detailed ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                    {g.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3" />
                        {g.phone}
                      </span>
                    ) : null}
                    {g.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-3" />
                        {g.email}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {g.canPickUp ? <Chip>Can pick up</Chip> : null}
              {g.isFeePayer ? <Chip>Fee payer</Chip> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function EnrolmentList({
  rows,
  sessionNameById,
  classNameById,
  fallbackClassName,
}: {
  rows: StudentEnrolment[];
  sessionNameById: Map<number, string>;
  classNameById: Map<number, string>;
  fallbackClassName?: string | null;
}) {
  if (rows.length === 0) {
    return <EmptyNote text="No enrolments recorded." />;
  }
  return (
    <ul className="space-y-2">
      {rows.map((e) => {
        const classLabel =
          classNameById.get(e.classId) ||
          (e.status === 'active' ? fallbackClassName : null) ||
          `Class #${e.classId}`;
        const sessionLabel =
          sessionNameById.get(e.sessionId) || `Session #${e.sessionId}`;
        return (
          <li
            key={e.id}
            className="flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">{classLabel}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[
                  sessionLabel,
                  formatDisplayDate(e.enrolledAt)
                    ? `Enrolled ${formatDisplayDate(e.enrolledAt)}`
                    : null,
                  e.endedAt && formatDisplayDate(e.endedAt)
                    ? `Ended ${formatDisplayDate(e.endedAt)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <StatusBadge status={e.status} />
          </li>
        );
      })}
    </ul>
  );
}

function MedicalPanel({
  data,
  compact,
}: {
  data?: StudentMedicalInfo;
  compact?: boolean;
}) {
  const rows = [
    { label: 'Allergies', value: data?.allergies },
    { label: 'Conditions', value: data?.conditions },
    { label: 'Medications', value: data?.medications },
    { label: 'Emergency notes', value: data?.emergencyNotes },
  ].filter((r) => r.value && r.value.trim());

  if (rows.length === 0) {
    return <EmptyNote text="No medical notes recorded." />;
  }

  return (
    <div className="space-y-3">
      <dl className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2')}>
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {row.label}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
      {!compact && data?.updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last updated {formatDisplayDateTime(data.updatedAt) || formatDisplayDate(data.updatedAt)}
        </p>
      ) : null}
    </div>
  );
}


function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  className,
  action,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon className="size-3.5" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SummarySection({
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
        'space-y-3 border-b border-border p-5 last:border-b-0 lg:odd:border-r lg:[&:nth-last-child(-n+2)]:border-b-0',
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
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 pt-1 text-xs font-semibold text-teal-700 hover:underline"
    >
      {children}
      <ChevronRight className="size-3.5" />
    </Link>
  );
}
