'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { AdmissionWizard } from '@/features/admin/components/students/admission/admission-wizard';

export default function NewStudentPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AdmissionWizard />
    </Suspense>
  );
}
