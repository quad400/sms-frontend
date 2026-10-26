'use client';

import { useEffect, useState } from 'react';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterSelect } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useApproveLeave,
  useLeaveRequests,
  useLeaveTypes,
  useRejectLeave,
  useSaveLeaveTypes,
} from '../hooks/use-leave';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import type { LeaveRequest, LeaveType } from '../types';

export function LeavePage() {
  const [tab, setTab] = useState<'requests' | 'types'>('requests');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [rejectId, setRejectId] = useState<number | null>(null);
  const { density } = useAdminCampus();

  const requests = useLeaveRequests({ page, status: status || undefined }, tab === 'requests');
  const types = useLeaveTypes(tab === 'types');
  const approve = useApproveLeave();
  const reject = useRejectLeave();
  const saveTypes = useSaveLeaveTypes();

  const columns: DataTableColumn<LeaveRequest>[] = [
    { id: 'staff', header: 'Staff', cell: (r) => r.staffName ?? `Staff #${r.staffId}` },
    { id: 'dates', header: 'Dates', cell: (r) => `${r.startDate} → ${r.endDate}` },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'reason', header: 'Reason', cell: (r) => r.reason ?? '—' },
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) =>
        r.status === 'pending' ? (
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <PermissionGate permission="staff.leave.decide">
              <Button size="sm" variant="outline" onClick={() =>
                  approve.mutate(r.id, {
                    onSuccess: () => toastSuccess('Leave approved'),
                    onError: (e) => toastError('Could not approve', e.message),
                  })
                }>
                Approve
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejectId(r.id)}>
                Reject
              </Button>
            </PermissionGate>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave"
        actions={
          <SegmentedControl
            aria-label="Leave sections"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'requests', label: 'Requests' },
              { value: 'types', label: 'Leave types' },
            ]}
          />
        }
      />
      {tab === 'requests' ? (
        <>
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <QueryState isPending={requests.isPending} error={requests.error} onRetry={() => void requests.refetch()}>
            <DataTable columns={columns} rows={requests.data?.data ?? []} density={density} />
          </QueryState>
        </>
      ) : (
        <PermissionGate permission="staff.leave-type.manage" fallback={<p className="text-sm text-muted-foreground">You don’t have access to this.</p>}>
          <QueryState isPending={types.isPending} error={types.error} onRetry={() => void types.refetch()}>
            <LeaveTypesEditor
              types={types.data ?? []}
              isPending={saveTypes.isPending}
              onSave={(rows) =>
                saveTypes.mutate(rows, {
                  onSuccess: () => toastSuccess('Leave types saved'),
                  onError: (e) => toastError('Could not save types', e.message),
                })
              }
            />
          </QueryState>
        </PermissionGate>
      )}
      <ReasonDialog
        open={rejectId !== null}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject leave request"
        confirmLabel="Reject"
        destructive
        isPending={reject.isPending}
        onConfirm={(reason) =>
          rejectId &&
          reject.mutate(
            { id: rejectId, reason },
            {
              onSuccess: () => {
                toastSuccess('Leave rejected');
                setRejectId(null);
              },
              onError: (e) => toastError('Could not reject', e.message),
            },
          )
        }
      />
    </div>
  );
}

function LeaveTypesEditor({
  types,
  isPending,
  onSave,
}: {
  types: LeaveType[];
  isPending: boolean;
  onSave: (rows: LeaveType[]) => void;
}) {
  const [rows, setRows] = useState(types);
  useEffect(() => {
    setRows(types);
  }, [types]);
  return (
    <div className="space-y-3">
      {rows.map((t, i) => (
        <div key={t.id || i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3">
          <Input
            value={t.name}
            onChange={(e) =>
              setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))
            }
            placeholder="Name"
          />
          <Input
            value={t.code ?? ''}
            onChange={(e) =>
              setRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, code: e.target.value } : row)))
            }
            placeholder="Code"
          />
          <Input
            type="number"
            value={t.daysPerYear ?? ''}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((row, idx) =>
                  idx === i ? { ...row, daysPerYear: Number(e.target.value) || undefined } : row,
                ),
              )
            }
            placeholder="Days / year"
          />
        </div>
      ))}
      <Button type="button" disabled={isPending} onClick={() => onSave(rows)}>
        {isPending ? 'Saving…' : 'Save leave types'}
      </Button>
    </div>
  );
}
