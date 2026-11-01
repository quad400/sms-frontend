'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { CampusWizard } from '@/features/admin/components/structure/campus-wizard';

export default function NewCampusPage() {
  return (
    <Suspense fallback={<Loader />}>
      <CampusWizard />
    </Suspense>
  );
}
