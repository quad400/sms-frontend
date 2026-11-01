'use client';

import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';

export function AllocationsHeader({
  sessionLabel,
  onSave,
  saveDisabled,
  savePending,
}: {
  sessionLabel?: string | null;
  onSave?: () => void;
  saveDisabled?: boolean;
  savePending?: boolean;
}) {
  return (
    <PageHeader
      title="Teaching Allocations"
      titleAddon={
        sessionLabel ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
            {sessionLabel}
          </span>
        ) : (
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Staff ↔ subject matrix
          </span>
        )
      }
      description="Assign subject teachers to class arms for the active session — the roster that feeds timetables."
      actions={
        onSave ? (
          <PermissionGate permission="staff.allocation.update">
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              disabled={saveDisabled || savePending}
              onClick={onSave}
            >
              {savePending ? 'Saving…' : 'Save allocations'}
            </Button>
          </PermissionGate>
        ) : null
      }
    />
  );
}
