'use client';

import { Download, Plus, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { TIMETABLES_UI_MOCK } from './ui-mock';

export function TimetablesHeader({
  onCreate,
  onValidate,
}: {
  onCreate: () => void;
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
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={onCreate}
            >
              <Plus className="size-4" />
              Substitute Assignment
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
