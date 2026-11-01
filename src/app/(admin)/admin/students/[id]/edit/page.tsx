'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { AdmissionWizard } from '@/features/admin/components/students/admission/admission-wizard';

export default function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <AdmissionWizard mode="edit" initialStudentId={Number(id)} />
    </Suspense>
  );
}
