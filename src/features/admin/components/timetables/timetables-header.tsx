'use client';

import Link from 'next/link';
import { Download, Plus, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { TIMETABLES_UI_MOCK } from './ui-mock';

export function TimetablesHeader({
  createHref = '/admin/timetables/new',
  onValidate,
}: {
  createHref?: string;
  onValidate?: () => void;
}) {
  return (
    <PageHeader
      title="Master Scheduling & Period Dispatch"
      titleAddon={
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
          {TIMETABLES_UI_MOCK.engineBadge}
        </span>
      }
      description="Algorithmic timetable orchestration with room clash isolation and live period dispatch."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onValidate}>
            <ShieldCheck className="size-4" />
            Run Auto-Validator
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            <Download className="size-4" />
            Export Wall Grid
          </Button>
          <PermissionGate permission="academics.timetable.create">
            <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
              <Link href={createHref}>
                <Plus className="size-4" />
                New timetable
              </Link>
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
