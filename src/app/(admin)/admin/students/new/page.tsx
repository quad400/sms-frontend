'use client';

import { Suspense } from 'react';
import { AdmissionWizard } from '@/features/admin/components/students/admission/admission-wizard';

export default function NewStudentPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <AdmissionWizard />
    </Suspense>
  );
}
