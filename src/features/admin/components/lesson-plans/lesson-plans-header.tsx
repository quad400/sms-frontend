'use client';

import { Bell, FileBarChart } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/lib/auth/permissions';
import { LESSON_PLANS_UI_MOCK } from './ui-mock';

export function LessonPlansHeader({
  reminderCandidates = 0,
  onDigest,
  onReminders,
  remindersPending,
}: {
  reminderCandidates?: number;
  onDigest?: () => void;
  onReminders?: () => void;
  remindersPending?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
        {LESSON_PLANS_UI_MOCK.pacingLabel}
      </p>
      <PageHeader
        title="Lesson Plan Vetting"
        description="HOD review queue for weekly schemes of work — pacing alignment, overdue escalations, and approvals."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PermissionGate permission="academics.lesson-plan.list">
              <Button type="button" variant="outline" size="sm" onClick={onDigest}>
                <FileBarChart className="size-4" />
                Pacing Digest
              </Button>
            </PermissionGate>
            <PermissionGate permission="academics.lesson-plan.approve">
              <Button
                type="button"
                size="sm"
                className="bg-teal-700 hover:bg-teal-800"
                onClick={onReminders}
                disabled={remindersPending || reminderCandidates === 0}
              >
                <Bell className="size-4" />
                {remindersPending
                  ? 'Sending…'
                  : `Broadcast Reminders (${reminderCandidates})`}
              </Button>
            </PermissionGate>
          </div>
        }
      />
    </div>
  );
}
