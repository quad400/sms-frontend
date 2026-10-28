'use client';

import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';

export function ClassesHeader({
  sessionName,
  onExport,
  onCreateArm,
  onAddYearGroup,
}: {
  sessionName?: string | null;
  onExport?: () => void;
  onCreateArm: () => void;
  onAddYearGroup?: () => void;
}) {
  return (
    <PageHeader
      title="Class Management"
      titleAddon={
        sessionName ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
            {sessionName}
          </span>
        ) : null
      }
      description="Cohort arms, form tutors, and homeroom readiness for the active session."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={!onExport}>
            <Download className="size-4" />
            Export Roll
          </Button>
          {onAddYearGroup ? (
            <PermissionGate permission="school-structure.level.create">
              <Button type="button" variant="outline" size="sm" onClick={onAddYearGroup}>
                Add year group
              </Button>
            </PermissionGate>
          ) : null}
          <PermissionGate permission="school-structure.class.create">
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={onCreateArm}
            >
              <Plus className="size-4" />
              Create Class Arm
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
