'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { AttendanceHub } from '@/features/admin/components/attendance';

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <AttendanceHub />
    </Suspense>
  );
}
