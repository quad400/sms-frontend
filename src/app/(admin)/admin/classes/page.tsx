'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { ClassesList } from '@/features/admin/components/classes';

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ClassesList />
    </Suspense>
  );
}
