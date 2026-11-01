'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from 'lucide-react';
import { EmptyState } from '@/components/patterns/empty-state';
import { Fact } from '@/components/patterns/fact';
import { MetaChip } from '@/components/patterns/meta-chip';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { formatDisplayDateOrDash } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';
import { asRecord, str } from '@/lib/utils/record';
import { useLeaveRequests } from '../../hooks/use-leave';
import { useStaffAllocations, useStaffMember } from '../../hooks/use-staff';
import { useCampuses } from '../../hooks/use-structure';
import { GENDER_CODES, JOB_TITLE_CODES, labelForCode } from '../../lib/codes';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { avatarTone, initials } from './utils';

const TABS = [
  { href: '', label: 'Overview', permission: 'staff.staff.list', icon: UserRound },
  {
    href: '/allocations',
    label: 'Allocations',
    permission: 'staff.staff.list',
    icon: BookOpen,
  },
  { href: '/leave', label: 'Leave', permission: 'staff.leave.list', icon: CalendarDays },
  { href: '/account', label: 'Account', permission: 'staff.staff.list', icon: KeyRound },
] as const;

export function StaffProfile({
  staffId,
  tab = 'overview',
}: {
  staffId: number;
  tab?: string;
}) {
  const pathname = usePathname();
  const member = useStaffMember(staffId);
  const allocations = useStaffAllocations(
    staffId,
    tab === 'overview' || tab === 'allocations',
  );
  const leave = useLeaveRequests(
    { staffId: String(staffId) },
    tab === 'overview' || tab === 'leave',
  );
  const campuses = useCampuses();

  const s = member.data;
  const status = s?.statusCode ?? s?.status ?? 'active';
  const gender = labelForCode(GENDER_CODES, s?.genderCode);
  const job =
    s?.jobTitle ||
    labelForCode(JOB_TITLE_CODES, s?.jobTitleCode) ||
    s?.jobTitleCode;
  const campusName =
    s?.campusId != null
      ? (campuses.data ?? []).find((c) => c.id === s.campusId)?.name ?? `Campus ${s.campusId}`
      : null;

  return (
    <div className="space-y-5">
      <QueryState
        isPending={member.isPending}
        error={member.error}
        onRetry={() => void member.refetch()}
      >
        {!s ? (
          <EmptyState
            icon={UserRound}
            title="Staff member not available"
            description="This record may have been removed or you may not have access."
            className="bg-card shadow-[var(--shadow-card)]"
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/staff">Back to directory</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Link
              href="/admin/staff"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to directory
            </Link>

            <header className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="bg-[linear-gradient(160deg,rgba(15,118,110,0.1),transparent_55%)] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={cn(
                        'flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ring-1 ring-black/5',
                        avatarTone(s.staffNumber ?? s.genderCode),
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
                          {s.staffNumber ?? `STA-${s.id}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={status} />
                        {job ? <MetaChip>{job}</MetaChip> : null}
                        {campusName ? (
                          <MetaChip className="bg-teal-50 text-teal-800">{campusName}</MetaChip>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {s.email ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Mail className="size-3.5" aria-hidden />
                            {s.email}
                          </span>
                        ) : null}
                        {s.phone ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5" aria-hidden />
                            {s.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <PermissionGate permission="staff.staff.update">
                      <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                        <Link href={`/admin/staff/${staffId}/edit`}>
                          <Pencil className="size-3.5" />
                          Edit
                        </Link>
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </div>

              <nav
                className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2"
                aria-label="Staff sections"
              >
                {TABS.map((t) => {
                  const href = `/admin/staff/${staffId}${t.href}`;
                  const active =
                    t.href === ''
                      ? pathname === `/admin/staff/${staffId}`
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
                    <Fact label="Job title" value={job} />
                    <Fact label="Email" value={s.email} />
                    <Fact label="Phone" value={s.phone} />
                    <Fact label="Hire date" value={formatDate(s.hireDate)} />
                    <Fact label="Campus" value={campusName} />
                  </dl>
                </Panel>

                <div className="space-y-4 lg:col-span-2">
                  <Panel title="Allocations" icon={BookOpen}>
                    <QueryState
                      isPending={allocations.isPending}
                      error={allocations.error}
                      onRetry={() => void allocations.refetch()}
                      loaderVariant="inline"
                    >
                      <AllocationList data={allocations.data} limit={4} />
                    </QueryState>
                    <Link
                      href={`/admin/staff/${staffId}/allocations`}
                      className="mt-3 inline-flex items-center gap-0.5 text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View all allocations
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </Panel>

                  <Panel title="Recent leave" icon={CalendarDays}>
                    <QueryState
                      isPending={leave.isPending}
                      error={leave.error}
                      onRetry={() => void leave.refetch()}
                      loaderVariant="inline"
                    >
                      <LeaveList rows={leave.data?.data ?? []} limit={3} />
                    </QueryState>
                    <Link
                      href={`/admin/staff/${staffId}/leave`}
                      className="mt-3 inline-flex items-center gap-0.5 text-xs font-semibold text-teal-700 hover:underline"
                    >
                      View leave history
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </Panel>
                </div>
              </div>
            ) : null}

            {tab === 'allocations' ? (
              <Panel title="Teaching allocations" icon={BookOpen}>
                <QueryState
                  isPending={allocations.isPending}
                  error={allocations.error}
                  onRetry={() => void allocations.refetch()}
                  loaderVariant="table"
                >
                  <AllocationList data={allocations.data} />
                </QueryState>
              </Panel>
            ) : null}

            {tab === 'leave' ? (
              <Panel title="Leave requests" icon={CalendarDays}>
                <QueryState
                  isPending={leave.isPending}
                  error={leave.error}
                  onRetry={() => void leave.refetch()}
                  loaderVariant="table"
                >
                  <LeaveList rows={leave.data?.data ?? []} />
                </QueryState>
              </Panel>
            ) : null}

            {tab === 'account' ? (
              <Panel title="Portal account" icon={KeyRound}>
                {s.userId ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This staff member has a linked login (user #{s.userId}). Roles and campus
                      access are managed under Access → Users.
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/access/users">Open users</Link>
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={KeyRound}
                    title="No login linked"
                    description="Invite this staff member from Access → Users, or complete onboarding with an account invite."
                    className="border-0 bg-transparent py-6 shadow-none"
                  />
                )}
              </Panel>
            ) : null}
          </>
        )}
      </QueryState>
    </div>
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


function AllocationList({ data, limit }: { data: unknown; limit?: number }) {
  const rows = Array.isArray(data) ? data : (asRecord(data)?.data as unknown[] | undefined);
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No allocations"
        description="This staff member is not assigned to any classes yet."
        className="border-0 bg-transparent py-6 shadow-none"
      />
    );
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border">
      {shown.map((e, i) => {
        const r = asRecord(e) ?? {};
        return (
          <li
            key={typeof r.id === 'number' ? r.id : i}
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
          >
            <span className="min-w-0 truncate font-semibold">
              {str(r.className) || `Class ${String(r.classId ?? '—')}`}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {str(r.subjectName) || str(r.subjectCode) || '—'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function LeaveList({
  rows,
  limit,
}: {
  rows: Array<{ id: number; startDate: string; endDate: string; status: string }>;
  limit?: number;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No leave requests"
        description="Leave requests for this staff member will appear here."
        className="border-0 bg-transparent py-6 shadow-none"
      />
    );
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className="space-y-2">
      {shown.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm"
        >
          <span className="font-medium">
            {formatDate(r.startDate)} → {formatDate(r.endDate)}
          </span>
          <StatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso?: string | null): string {
  return formatDisplayDateOrDash(iso);
}
