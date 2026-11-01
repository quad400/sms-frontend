'use client';

import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { STUDENTS_UI_MOCK } from './ui-mock';

export function StudentsHeader() {
  return (
    <PageHeader
      title="Students"
      description={STUDENTS_UI_MOCK.description}
      actions={
        <div className="flex flex-wrap items-center gap-2">
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
