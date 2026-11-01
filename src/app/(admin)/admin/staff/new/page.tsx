'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { StaffOnboardingWizard } from '@/features/admin/components/staff/onboarding';

export default function NewStaffPage() {
  return (
    <Suspense fallback={<Loader />}>
      <StaffOnboardingWizard />
    </Suspense>
  );
}
