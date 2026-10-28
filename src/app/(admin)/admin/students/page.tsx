'use client';

import { Suspense } from 'react';
import { StudentsList } from '@/features/admin/components/students';

export default function StudentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading students…</p>}>
      <StudentsList />
    </Suspense>
  );
}
