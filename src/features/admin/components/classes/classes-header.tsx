'use client';

import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';

export function ClassesHeader({
  sessionName,
  onExport,
  createHref,
  yearGroupHref,
}: {
  sessionName?: string | null;
  onExport?: () => void;
  createHref?: string;
  yearGroupHref?: string;
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
          {yearGroupHref ? (
            <PermissionGate permission="school-structure.level.create">
              <Button asChild variant="outline" size="sm">
                <Link href={yearGroupHref}>Add year group</Link>
              </Button>
            </PermissionGate>
          ) : null}
          {createHref ? (
            <PermissionGate permission="school-structure.class.create">
              <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                <Link href={createHref}>
                  <Plus className="size-4" />
                  Create Class Arm
                </Link>
              </Button>
            </PermissionGate>
          ) : null}
        </div>
      }
    />
  );
}
