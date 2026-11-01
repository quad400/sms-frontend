'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { ClassWizard } from '@/features/admin/components/classes/class-wizard';

export default function NewClassPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ClassWizard />
    </Suspense>
  );
}
