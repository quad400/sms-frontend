'use client';

import { Suspense } from 'react';
import { ClassesList } from '@/features/admin/components/classes';

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <ClassesList />
    </Suspense>
  );
}
