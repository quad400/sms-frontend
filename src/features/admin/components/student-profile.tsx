'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ConfirmDialog, ReasonDialog } from '@/components/patterns/confirm-dialog';
import { EntityHeader } from '@/components/patterns/entity-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import {
  useArchiveStudent,
  useCreateTransfer,
  useStudent,
  useStudentEnrolments,
  useStudentGuardians,
} from '../hooks/use-students';
import { TRANSFER_TYPE_CODES } from '../lib/codes';
import { QueryState } from '../lib/shared';
import { fullName } from '../types';
import { StudentAccountPanel } from './fees-pages';

const TABS = [
  { href: '', label: 'Overview', permission: 'students.student.read' },
  { href: '/guardians', label: 'Guardians', permission: 'students.guardian.list' },
  { href: '/enrolment', label: 'Enrolment', permission: 'students.enrolment.list' },
  { href: '/attendance', label: 'Attendance', permission: 'attendance.register.list' },
  { href: '/results', label: 'Results', permission: 'assessment.result.list' },
  { href: '/fees', label: 'Fees', permission: 'fees.account.read' },
  { href: '/medical', label: 'Medical', permission: 'students.medical.read' },
  { href: '/consents', label: 'Consents', permission: 'students.student.read' },
  { href: '/audit', label: 'Audit', permission: 'audit.log.list' },
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

  return (
    <div className="space-y-5">
      <QueryState isPending={student.isPending} error={student.error} onRetry={() => void student.refetch()}>
        {!s ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Student not available.
          </p>
        ) : (
          <>
            <EntityHeader
              title={fullName(s.firstName, s.lastName, s.middleName)}
              subtitle={s.studentNumber}
              status={status}
              meta={s.className ? `Class ${s.className}` : undefined}
              banner={
                archived ? (
                  <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                    This student is read-only ({status}).
                  </p>
                ) : null
              }
              actions={
                <>
                  <PermissionGate permission="students.student.update">
                    <Button asChild variant="outline" size="sm" disabled={archived}>
                      <Link href={`/admin/students/${studentId}/edit`}>Edit</Link>
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
                      Transfer
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="students.student.archive">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={archived}
                      onClick={() => setArchiveOpen(true)}
                    >
                      Archive
                    </Button>
                  </PermissionGate>
                </>
              }
            />
            <nav className="flex flex-wrap gap-1 border-b border-border pb-2">
              {TABS.map((t) => {
                const href = `/admin/students/${studentId}${t.href}`;
                const active =
                  t.href === ''
                    ? pathname === `/admin/students/${studentId}`
                    : pathname.startsWith(href);
                return (
                  <PermissionGate key={t.href || 'overview'} permission={t.permission}>
                    <Link
                      href={href}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm',
                        active ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60',
                      )}
                    >
                      {t.label}
                    </Link>
                  </PermissionGate>
                );
              })}
            </nav>

            {tab === 'overview' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card title="Facts">
                  <Row label="Number" value={s.studentNumber} />
                  <Row label="Gender" value={s.genderCode ?? s.gender} />
                  <Row label="Campus" value={s.campusId != null ? String(s.campusId) : '—'} />
                </Card>
                <Card title="Guardians">
                  <GuardianPreview data={guardians.data} />
                </Card>
              </div>
            ) : null}

            {tab === 'guardians' ? (
              <Card title="Guardians">
                <GuardianPreview data={guardians.data} detailed />
              </Card>
            ) : null}

            {tab === 'enrolment' ? (
              <Card title="Enrolment history">
                <EnrolmentList data={enrolments.data} />
              </Card>
            ) : null}

            {tab === 'fees' ? (
              <Card title="Fees">
                <StudentAccountPanel studentId={studentId} />
              </Card>
            ) : null}

            {['attendance', 'results', 'medical', 'consents', 'audit'].includes(tab) ? (
              <Card title={tab.charAt(0).toUpperCase() + tab.slice(1)}>
                {tab === 'medical' ? (
                  <p className="mb-3 text-xs text-amber-800 dark:text-amber-200">
                    This access is logged.
                  </p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  No data wired for this tab yet, or the related API returned nothing.
                </p>
              </Card>
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
            <select
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={transferType}
              onChange={(e) => setTransferType(e.target.value)}
            >
              {TRANSFER_TYPE_CODES.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Effective date</Label>
            <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Destination</Label>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="School or campus" />
          </div>
        </div>
      </ReasonDialog>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 font-heading text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}

function GuardianPreview({ data, detailed }: { data: unknown; detailed?: boolean }) {
  const rows = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data;
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No guardians linked.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((g, i) => {
        const r = g as Record<string, unknown>;
        const id = typeof r.id === 'number' ? r.id : i;
        const name = [r.firstName, r.lastName].filter((x) => typeof x === 'string').join(' ') || 'Guardian';
        return (
          <li key={id} className="flex justify-between gap-2">
            <span>
              {detailed && typeof r.id === 'number' ? (
                <Link className="text-primary hover:underline" href={`/admin/guardians/${r.id}`}>
                  {name}
                </Link>
              ) : (
                name
              )}
            </span>
            <span className="text-muted-foreground">{typeof r.phone === 'string' ? r.phone : ''}</span>
          </li>
        );
      })}
    </ul>
  );
}

function EnrolmentList({ data }: { data: unknown }) {
  const rows = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data;
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No enrolments.</p>;
  }
  return (
    <ul className="space-y-2 text-sm">
      {rows.map((e, i) => {
        const r = e as Record<string, unknown>;
        return (
          <li key={typeof r.id === 'number' ? r.id : i} className="rounded-lg border border-border/70 px-3 py-2">
            Class {String(r.classId ?? r.className ?? '—')} · {String(r.status ?? r.statusCode ?? '')}
          </li>
        );
      })}
    </ul>
  );
}
