'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { SessionWizard } from '@/features/admin/components/structure/session-wizard';

export default function NewSessionPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SessionWizard />
    </Suspense>
  );
}
