'use client';

import { Suspense } from 'react';
import { StaffOnboardingWizard } from '@/features/admin/components/staff/onboarding';

export default function NewStaffPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <StaffOnboardingWizard />
    </Suspense>
  );
}
