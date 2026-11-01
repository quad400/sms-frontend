'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { TimetableCreateWizard } from '@/features/admin/components/timetables/timetable-create-wizard';

export default function NewTimetablePage() {
  return (
    <Suspense fallback={<Loader />}>
      <TimetableCreateWizard />
    </Suspense>
  );
}
