'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Pencil,
  UserRound,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Fact } from '@/components/patterns/fact';
import { MetaChip } from '@/components/patterns/meta-chip';
import { QuickLink } from '@/components/patterns/quick-link';
import { StatusBadge } from '@/components/patterns/status-badge';
import { PermissionGate } from '@/lib/auth/permissions';
import { formatDisplayDateOrDash } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';
import { asRecord, str } from '@/lib/utils/record';
import { useLeaveRequests } from '../../hooks/use-leave';
import { useStaffAllocations, useStaffMember } from '../../hooks/use-staff';
import { GENDER_CODES, JOB_TITLE_CODES, labelForCode } from '../../lib/codes';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { avatarTone, initials } from './utils';

type SheetTab = 'overview' | 'allocations' | 'leave';

const TABS = [
  { id: 'overview' as const, label: 'Overview', permission: 'staff.staff.list' },
  { id: 'allocations' as const, label: 'Allocations', permission: 'staff.staff.list' },
  { id: 'leave' as const, label: 'Leave', permission: 'staff.leave.list' },
];

export function StaffDetailSheet({
  staffId,
  open,
  onOpenChange,
}: {
  staffId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<SheetTab>('overview');
  const id = staffId ?? 0;
  const member = useStaffMember(staffId, open && staffId != null);
  const allocations = useStaffAllocations(
    id,
    open && staffId != null && (tab === 'overview' || tab === 'allocations'),
  );
  const leave = useLeaveRequests(
    { staffId: String(id) },
    open && staffId != null && tab === 'leave',
  );

  const s = member.data;
  const status = s?.statusCode ?? s?.status ?? 'active';
  const gender = labelForCode(GENDER_CODES, s?.genderCode);
  const job =
    s?.jobTitle ||
    labelForCode(JOB_TITLE_CODES, s?.jobTitleCode) ||
    s?.jobTitleCode;

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
          isPending={member.isPending}
          error={member.error}
          onRetry={() => void member.refetch()}
        >
          {!s ? (
            <p className="p-6 pt-10 text-sm text-muted-foreground">Staff member not available.</p>
          ) : (
            <>
              <div className="relative overflow-hidden border-b border-border bg-[linear-gradient(160deg,rgba(15,118,110,0.08),transparent_55%)] px-6 pb-5 pt-6">
                <SheetHeader className="pr-10">
                  <div className="flex items-start gap-4">
                    <span
                      className={cn(
                        'flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ring-1 ring-black/5',
                        avatarTone(s.staffNumber ?? s.genderCode),
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
                          {s.staffNumber ?? `STA-${s.id}`}
                        </SheetDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={status} />
                        {job ? <MetaChip>{job}</MetaChip> : null}
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="mt-4 flex flex-wrap gap-2">
                  <PermissionGate permission="staff.staff.update">
                    <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                      <Link href={`/admin/staff/${id}/edit`}>
                        <Pencil className="size-3.5" />
                        Edit info
                      </Link>
                    </Button>
                  </PermissionGate>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/staff/${id}`}>
                      <ExternalLink className="size-3.5" />
                      Full profile
                    </Link>
                  </Button>
                </div>
              </div>

              <nav
                className="sticky top-0 z-10 flex gap-1 border-b border-border bg-card/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-card/80"
                aria-label="Staff sections"
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
                        <Fact label="Job title" value={job} />
                        <Fact label="Email" value={s.email} className="col-span-2" />
                        <Fact label="Phone" value={s.phone} />
                        <Fact label="Hire date" value={formatDate(s.hireDate)} />
                      </dl>
                    </Panel>

                    <Panel
                      title="Allocations"
                      icon={BookOpen}
                      action={
                        <button
                          type="button"
                          className="inline-flex items-center gap-0.5 text-xs font-semibold text-teal-700 hover:underline"
                          onClick={() => setTab('allocations')}
                        >
                          View all
                          <ChevronRight className="size-3.5" />
                        </button>
                      }
                    >
                      <AllocationPreview data={allocations.data} limit={3} />
                    </Panel>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <QuickLink
                        href={`/admin/staff/${id}/allocations`}
                        icon={BookOpen}
                        label="Allocations"
                        hint="Classes & subjects"
                      />
                      <QuickLink
                        href={`/admin/staff/${id}/leave`}
                        icon={CalendarDays}
                        label="Leave"
                        hint="Requests & balance"
                      />
                    </div>
                  </>
                ) : null}

                {tab === 'allocations' ? (
                  <Panel title="Teaching allocations" icon={BookOpen}>
                    <QueryState
                      isPending={allocations.isPending}
                      error={allocations.error}
                      onRetry={() => void allocations.refetch()}
                    >
                      <AllocationPreview data={allocations.data} />
                    </QueryState>
                  </Panel>
                ) : null}

                {tab === 'leave' ? (
                  <Panel title="Leave requests" icon={CalendarDays}>
                    <QueryState
                      isPending={leave.isPending}
                      error={leave.error}
                      onRetry={() => void leave.refetch()}
                    >
                      <LeavePreview rows={leave.data?.data ?? []} />
                    </QueryState>
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



function AllocationPreview({ data, limit }: { data: unknown; limit?: number }) {
  const rows = Array.isArray(data) ? data : (asRecord(data)?.data as unknown[] | undefined);
  if (!Array.isArray(rows) || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No allocations.</p>;
  }
  const shown = limit != null ? rows.slice(0, limit) : rows;
  return (
    <ul className="space-y-2">
      {shown.map((e, i) => {
        const r = asRecord(e) ?? {};
        return (
          <li
            key={typeof r.id === 'number' ? r.id : i}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="font-medium">
              {str(r.className) || `Class ${String(r.classId ?? '—')}`}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {str(r.subjectName) || str(r.subjectCode) || '—'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function LeavePreview({
  rows,
}: {
  rows: Array<{ id: number; startDate: string; endDate: string; status: string }>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No leave requests.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.slice(0, 8).map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
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
