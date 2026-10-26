'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Badge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useStaffAllocations, useStaffMe } from '../hooks/use-staff-me';
import { ClassAttendanceTab } from './classes/class-attendance-tab';
import { ClassNotesTab } from './classes/class-notes-tab';
import { ClassScoresTab } from './classes/class-scores-tab';
import { ClassStudentsTab } from './classes/class-students-tab';

type Tab = 'students' | 'attendance' | 'scores' | 'notes';

export function StaffClassDetail({ classId }: { classId: number }) {
  const lookups = useStaffLookups();
  const me = useStaffMe();
  const allocations = useStaffAllocations();
  const { can } = useSession();
  const [tab, setTab] = useState<Tab>('students');

  const tabs = [
    { value: 'students' as const, label: 'Students', show: can('students.student.list') },
    { value: 'attendance' as const, label: 'Attendance', show: can('attendance.register.list') },
    { value: 'scores' as const, label: 'Scores', show: can('assessment.assessment.list') },
    { value: 'notes' as const, label: 'Lesson notes', show: can('academics.lesson-note.list') },
  ].filter((item) => item.show);
  const active = tabs.some((item) => item.value === tab) ? tab : (tabs[0]?.value ?? 'students');

  const subjects = [
    ...new Set(
      (allocations.data ?? [])
        .filter((allocation) => allocation.classId === classId)
        .map((allocation) => allocation.subjectId),
    ),
  ];
  const isFormTeacher =
    me.data?.staffId !== undefined && lookups.classOf(classId)?.formTeacherStaffId === me.data.staffId;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={
          <Link
            href="/staff/classes"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            My classes
          </Link>
        }
        title={lookups.className(classId)}
        description={
          subjects.length > 0
            ? `You teach ${subjects.map((id) => lookups.subjectName(id)).join(', ')}.`
            : undefined
        }
        actions={isFormTeacher ? <Badge variant="soft">Form teacher</Badge> : undefined}
      >
        {tabs.length > 1 ? (
          <div className="overflow-x-auto">
            <SegmentedControl
              aria-label="Class sections"
              value={active}
              onValueChange={setTab}
              options={tabs.map(({ value, label }) => ({ value, label }))}
            />
          </div>
        ) : null}
      </PageHeader>

      {active === 'students' ? <ClassStudentsTab classId={classId} /> : null}
      {active === 'attendance' ? <ClassAttendanceTab classId={classId} /> : null}
      {active === 'scores' ? <ClassScoresTab classId={classId} /> : null}
      {active === 'notes' ? <ClassNotesTab classId={classId} /> : null}
    </div>
  );
}
