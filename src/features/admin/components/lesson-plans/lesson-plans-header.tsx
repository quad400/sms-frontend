'use client';

import { Bell, FileBarChart } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { LESSON_PLANS_UI_MOCK } from './ui-mock';

export function LessonPlansHeader({
  onDigest,
  onReminders,
}: {
  onDigest?: () => void;
  onReminders?: () => void;
}) {
  const reminders = LESSON_PLANS_UI_MOCK.summary.reminders;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
        {LESSON_PLANS_UI_MOCK.pacingLabel}
      </p>
      <PageHeader
        title="Curriculum & Lesson Plan Vetting"
        description="HOD review queue for weekly schemes of work — pacing alignment, overdue escalations, and approvals."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onDigest}>
              <FileBarChart className="size-4" />
              Pacing Digest
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={onReminders}
            >
              <Bell className="size-4" />
              Broadcast Reminders ({reminders})
            </Button>
          </div>
        }
      />
    </div>
  );
}
