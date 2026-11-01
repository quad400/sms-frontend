'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { SubjectWizard } from '@/features/admin/components/subjects/subject-wizard';

export default function NewSubjectPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SubjectWizard />
    </Suspense>
  );
}
