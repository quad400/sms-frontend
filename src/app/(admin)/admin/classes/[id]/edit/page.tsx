'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { ClassWizard } from '@/features/admin/components/classes/class-wizard';

export default function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <ClassWizard mode="edit" initialClassId={Number(id)} />
    </Suspense>
  );
}
