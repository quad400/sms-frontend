'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { SessionWizard } from '@/features/admin/components/structure/session-wizard';

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <SessionWizard mode="edit" initialSessionId={Number(id)} />
    </Suspense>
  );
}
