'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { useApproveResultSheet, useRejectResultSheet, useResultSheets } from '../hooks/use-assessments';
import { APPROVAL_PERMISSIONS } from '../hooks/use-approvals';
import { useApproveLessonPlan, useLessonPlans } from '../hooks/use-lessons';
import {
  useApproveLeaveRequest,
  useLeaveRequests,
  useRejectLeaveRequest,
} from '../hooks/use-leave';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useStaffMe } from '../hooks/use-staff-me';
import { formatDate, inclusiveDays, plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import { ConfirmDialog } from './shared/confirm-dialog';
import { EmptyPanel } from './shared/panel';

type Kind = 'results' | 'lessonPlans' | 'leave';

type Pending = {
  kind: Kind;
  decision: 'approve' | 'reject';
  id: number;
  label: string;
};

const TAB_LABEL: Record<Kind, string> = {
  results: 'Results',
  lessonPlans: 'Lesson plans',
  leave: 'Leave',
};

export function StaffApprovals() {
  const { can } = useSession();
  const me = useStaffMe();
  const lookups = useStaffLookups();

  const allowed = (Object.keys(TAB_LABEL) as Kind[]).filter((kind) => can(APPROVAL_PERMISSIONS[kind]));
  const [chosen, setChosen] = useState<Kind | null>(null);
  const tab = chosen && allowed.includes(chosen) ? chosen : allowed[0];

  const sheets = useResultSheets('submitted', allowed.includes('results'));
  const plans = useLessonPlans({ status: 'submitted' }, allowed.includes('lessonPlans'));
  const leave = useLeaveRequests({ status: 'pending' }, allowed.includes('leave'));

  const approveSheet = useApproveResultSheet();
  const rejectSheet = useRejectResultSheet();
  const approvePlan = useApproveLessonPlan();
  const approveLeave = useApproveLeaveRequest();
  const rejectLeave = useRejectLeaveRequest();

  const [pending, setPending] = useState<Pending | null>(null);

  const counts: Record<Kind, number> = {
    results: sheets.data?.meta.total ?? 0,
    lessonPlans: plans.data?.meta.total ?? 0,
    leave: (leave.data?.data ?? []).filter((r) => r.staffId !== me.data?.staffId).length,
  };

  const options = useMemo(
    () =>
      allowed.map((kind) => ({
        value: kind,
        label: counts[kind] > 0 ? `${TAB_LABEL[kind]} (${counts[kind]})` : TAB_LABEL[kind],
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowed.join(','), counts.results, counts.lessonPlans, counts.leave],
  );

  const mutation = pending
    ? {
        results:
          pending.decision === 'approve' ? approveSheet : rejectSheet,
        lessonPlans: approvePlan,
        leave: pending.decision === 'approve' ? approveLeave : rejectLeave,
      }[pending.kind]
    : null;

  function confirm(reason: string) {
    if (!pending) return;
    const done = { onSuccess: () => setPending(null) };
    const { kind, decision, id } = pending;
    if (kind === 'results') {
      if (decision === 'approve') approveSheet.mutate({ id, reason: reason || undefined }, done);
      else rejectSheet.mutate({ id, reason }, done);
    } else if (kind === 'lessonPlans') {
      approvePlan.mutate(id, done);
    } else if (decision === 'approve') {
      approveLeave.mutate({ id, note: reason || undefined }, done);
    } else {
      rejectLeave.mutate({ id, reason }, done);
    }
  }

  if (allowed.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Approvals" />
        <EmptyPanel
          icon={CheckCheck}
          title="Nothing to approve"
          description="Your role doesn’t include approving results, lesson plans or leave."
        />
      </div>
    );
  }

  const reasonConfig =
    pending && pending.kind !== 'lessonPlans'
      ? { label: pending.decision === 'reject' ? 'Reason' : 'Note', required: pending.decision === 'reject' }
      : undefined;

  return (
    <div className="space-y-5">
      <PageHeader title="Approvals" description="Review items waiting for your decision." />
      {allowed.length > 1 ? (
        <SegmentedControl
          value={tab as Kind}
          onValueChange={setChosen}
          options={options}
          aria-label="Approval queue"
        />
      ) : null}

      {tab === 'results' ? (
        <QueueState query={sheets} empty="No result sheets are waiting for approval." count={counts.results}>
          {(sheets.data?.data ?? []).map((sheet) => {
            const label = `${lookups.className(sheet.classId)} · ${lookups.termLabel(sheet.termId)}`;
            return (
              <ApprovalRow
                key={sheet.id}
                title={`${lookups.className(sheet.classId)} result sheet`}
                subtitle={`${lookups.termLabel(sheet.termId)} · submitted ${formatDate(sheet.submittedAt ?? sheet.createdAt)}`}
                onApprove={() => setPending({ kind: 'results', decision: 'approve', id: sheet.id, label })}
                onReject={() => setPending({ kind: 'results', decision: 'reject', id: sheet.id, label })}
              />
            );
          })}
        </QueueState>
      ) : null}

      {tab === 'lessonPlans' ? (
        <QueueState query={plans} empty="No lesson plans are waiting for approval." count={counts.lessonPlans}>
          {(plans.data?.data ?? []).map((plan) => (
            <ApprovalRow
              key={plan.id}
              title={plan.title}
              subtitle={`${lookups.className(plan.classId)} · ${lookups.subjectName(plan.subjectId)}${plan.weekNumber ? ` · Week ${plan.weekNumber}` : ''}`}
              body={plan.objectives ?? undefined}
              onApprove={() =>
                setPending({ kind: 'lessonPlans', decision: 'approve', id: plan.id, label: plan.title })
              }
            />
          ))}
        </QueueState>
      ) : null}

      {tab === 'leave' ? (
        <QueueState query={leave} empty="No leave requests are waiting for a decision." count={leave.data?.data.length ?? 0}>
          {(leave.data?.data ?? []).map((request) => {
            const own = request.staffId === me.data?.staffId;
            const label = `${request.staffName} · ${request.leaveTypeName}`;
            return (
              <ApprovalRow
                key={request.id}
                title={request.staffName}
                subtitle={`${request.leaveTypeName} · ${formatDate(request.startDate)}${request.endDate !== request.startDate ? ` – ${formatDate(request.endDate)}` : ''} · ${plural(inclusiveDays(request.startDate, request.endDate), 'day')}`}
                body={request.reason ?? undefined}
                note={own ? 'Your own request — another approver must decide it.' : undefined}
                onApprove={
                  own ? undefined : () => setPending({ kind: 'leave', decision: 'approve', id: request.id, label })
                }
                onReject={
                  own ? undefined : () => setPending({ kind: 'leave', decision: 'reject', id: request.id, label })
                }
              />
            );
          })}
        </QueueState>
      ) : null}

      <ConfirmDialog
        key={pending ? `${pending.kind}-${pending.id}-${pending.decision}` : 'none'}
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) setPending(null);
        }}
        title={pending?.decision === 'reject' ? 'Reject this item?' : 'Approve this item?'}
        description={pending?.label}
        confirmLabel={pending?.decision === 'reject' ? 'Reject' : 'Approve'}
        destructive={pending?.decision === 'reject'}
        reason={reasonConfig}
        isPending={mutation?.isPending ?? false}
        error={mutation?.error?.message ?? null}
        onConfirm={confirm}
      />
    </div>
  );
}

function QueueState({
  query,
  empty,
  count,
  children,
}: {
  query: { isPending: boolean; error: unknown; refetch: () => unknown };
  empty: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <QueryState
      isPending={query.isPending}
      error={query.error}
      onRetry={() => void query.refetch()}
      isEmpty={count === 0}
      empty={<EmptyPanel icon={CheckCheck} title="All caught up" description={empty} />}
    >
      <ul className="grid gap-2.5">{children}</ul>
    </QueryState>
  );
}

function ApprovalRow({
  title,
  subtitle,
  body,
  note,
  onApprove,
  onReject,
}: {
  title: string;
  subtitle: string;
  body?: string;
  note?: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <li className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Badge variant="soft">Awaiting</Badge>
      </div>
      {body ? <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{body}</p> : null}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      {onApprove || onReject ? (
        <div className="flex justify-end gap-2">
          {onReject ? (
            <Button type="button" variant="outline" size="sm" onClick={onReject}>
              Reject
            </Button>
          ) : null}
          {onApprove ? (
            <Button type="button" size="sm" onClick={onApprove}>
              Approve
            </Button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
