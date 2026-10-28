'use client';

import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';

export function SubjectsHeader({
  sessionLabel,
  onExport,
  onAdd,
}: {
  sessionLabel?: string | null;
  onExport?: () => void;
  onAdd: () => void;
}) {
  return (
    <PageHeader
      title="Academic Subjects & Syllabus"
      titleAddon={
        sessionLabel ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            {sessionLabel}
          </span>
        ) : (
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Curriculum registry
          </span>
        )
      }
      description="Curriculum distribution, compulsory cores, and teaching rosters across junior and senior levels."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onExport} disabled={!onExport}>
            <Download className="size-4" />
            Export Scheme
          </Button>
          <PermissionGate permission="school-structure.subject.create">
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={onAdd}
            >
              <Plus className="size-4" />
              Add Subject to Curriculum
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
