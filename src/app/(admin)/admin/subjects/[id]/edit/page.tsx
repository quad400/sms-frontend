'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { SubjectWizard } from '@/features/admin/components/subjects/subject-wizard';

export default function EditSubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <SubjectWizard mode="edit" initialSubjectId={Number(id)} />
    </Suspense>
  );
}
