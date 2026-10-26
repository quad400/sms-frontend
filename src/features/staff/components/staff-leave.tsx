'use client';

import { useMemo, useState } from 'react';
import { CalendarOff, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { useCancelLeaveRequest, useLeaveRequests } from '../hooks/use-leave';
import { useStaffMe } from '../hooks/use-staff-me';
import { formatDate, inclusiveDays, plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import type { LeaveRequest } from '../types';
import { LeaveRequestSheet } from './leave/leave-request-sheet';
import { ConfirmDialog } from './shared/confirm-dialog';
import { EmptyPanel } from './shared/panel';
import { StatusBadge } from './shared/status-badge';

export function StaffLeave() {
  const { can } = useSession();
  const me = useStaffMe();
  const staffId = me.data?.staffId;
  const requests = useLeaveRequests({ staffId }, staffId !== undefined);
  const cancel = useCancelLeaveRequest();
  const [open, setOpen] = useState(false);
  const [toCancel, setToCancel] = useState<LeaveRequest | null>(null);

  const rows = useMemo(
    () => [...(requests.data?.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests.data],
  );
  const canCreate = can('staff.leave.create');
  const canCancel = can('staff.leave.cancel');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave"
        description="Request time off and track your requests."
        actions={
          canCreate ? (
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Request leave
            </Button>
          ) : undefined
        }
      />

      <QueryState
        isPending={me.isPending || (staffId !== undefined && requests.isPending)}
        error={me.error ?? requests.error}
        onRetry={() => {
          void me.refetch();
          void requests.refetch();
        }}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={CalendarOff}
            title="No leave requests"
            description="Requests you send will be listed here with their status."
            action={
              canCreate ? (
                <Button type="button" onClick={() => setOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  Request leave
                </Button>
              ) : undefined
            }
          />
        }
      >
        <ul className="grid gap-2.5">
          {rows.map((request) => (
            <li
              key={request.id}
              className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{request.leaveTypeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(request.startDate)}
                    {request.endDate !== request.startDate ? ` – ${formatDate(request.endDate)}` : ''}
                    {' · '}
                    {plural(inclusiveDays(request.startDate, request.endDate), 'day')}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              {request.reason ? (
                <p className="text-sm text-muted-foreground">{request.reason}</p>
              ) : null}
              {request.decisionNote ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">Decision note: </span>
                  {request.decisionNote}
                </p>
              ) : null}
              {request.status === 'pending' && canCancel ? (
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setToCancel(request)}>
                    Cancel request
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </QueryState>

      <LeaveRequestSheet open={open} onOpenChange={setOpen} />

      <ConfirmDialog
        open={toCancel !== null}
        onOpenChange={(next) => {
          if (!next) setToCancel(null);
        }}
        title="Cancel this request?"
        description={
          toCancel
            ? `Your ${toCancel.leaveTypeName.toLowerCase()} request for ${formatDate(toCancel.startDate)} will be withdrawn.`
            : undefined
        }
        confirmLabel="Cancel request"
        destructive
        isPending={cancel.isPending}
        error={cancel.error?.message ?? null}
        onConfirm={() => {
          if (!toCancel) return;
          cancel.mutate(toCancel.id, { onSuccess: () => setToCancel(null) });
        }}
      />
    </div>
  );
}
