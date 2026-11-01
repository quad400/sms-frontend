'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { CampusWizard } from '@/features/admin/components/structure/campus-wizard';

export default function EditCampusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <CampusWizard mode="edit" initialCampusId={Number(id)} />
    </Suspense>
  );
}
