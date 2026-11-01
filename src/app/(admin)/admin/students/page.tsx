'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { StudentsList } from '@/features/admin/components/students';

export default function StudentsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <StudentsList />
    </Suspense>
  );
}
