'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, use } from 'react';
import { StaffOnboardingWizard } from '@/features/admin/components/staff/onboarding';

export default function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Loader />}>
      <StaffOnboardingWizard mode="edit" initialStaffId={Number(id)} />
    </Suspense>
  );
}
