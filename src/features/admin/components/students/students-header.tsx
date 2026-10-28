'use client';

import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { STUDENTS_UI_MOCK } from './ui-mock';

export function StudentsHeader({
  sessionName,
  onImport: _onImport,
}: {
  total?: number;
  sessionName?: string | null;
  onImport?: () => void;
}) {
  const session = sessionName || STUDENTS_UI_MOCK.sessionLabel;

  return (
    <PageHeader
      title="Students"
      titleAddon={
        <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
          {session}
        </span>
      }
      description={STUDENTS_UI_MOCK.description}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate permission="reporting.dashboard.read">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reports">
                <Download className="size-4" />
                Export Enrolment List
              </Link>
            </Button>
          </PermissionGate>
          <PermissionGate permission="students.student.create">
            <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
              <Link href="/admin/students/new">
                <Plus className="size-4" />
                Add Student
              </Link>
            </Button>
          </PermissionGate>
        </div>
      }
    />
  );
}
