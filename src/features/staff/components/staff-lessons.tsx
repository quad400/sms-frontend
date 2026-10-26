'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { LessonNotesTab } from './lessons/lesson-notes-tab';
import { LessonPlansTab } from './lessons/lesson-plans-tab';

type Tab = 'plans' | 'notes';

const TABS = [
  { value: 'plans', label: 'Lesson plans' },
  { value: 'notes', label: 'Lesson notes' },
] as const;

export function StaffLessons() {
  const [tab, setTab] = useState<Tab>('plans');
  return (
    <div className="space-y-5">
      <PageHeader
        title="Lessons"
        description="Plan upcoming lessons and share notes with your classes."
      />
      <SegmentedControl value={tab} onValueChange={setTab} options={TABS} aria-label="Lesson content" />
      {tab === 'plans' ? <LessonPlansTab /> : <LessonNotesTab />}
    </div>
  );
}
