'use client';

import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { STAFF_UI_MOCK } from './ui-mock';

export function StaffHeader({
  sessionLabel,
  onImport,
}: {
  sessionLabel?: string | null;
  onImport?: () => void;
}) {
  const session = sessionLabel || STAFF_UI_MOCK.sessionLabel;

  return (
    <PageHeader
      title="Staff Directory"
      titleAddon={
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
          · {session} ·
        </span>
      }
      description="Personnel roster, duty status, and teaching load across campuses."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission="reporting.dashboard.read">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reports">
                <Download className="size-4" />
                Staff Payroll Export
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permission="import-export.import.create">
            {onImport ? (
              <Button type="button" variant="outline" size="sm" onClick={onImport}>
                Import
              </Button>
            ) : null}
          </PermissionGate>
          <PermissionGate permission="staff.staff.create">
            <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
              <Link href="/admin/staff/new">
                <Plus className="size-4" />
                Onboard New Staff
              </Link>
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
