'use client';

import type { ReactNode } from 'react';
import { EmptyState } from '@/components/patterns/empty-state';
import { Loader } from '@/components/patterns/loader';
import { useFeatureFlags } from '@/lib/config/use-feature-flags';

export function ModuleGate({
  moduleFlag,
  children,
  fallback = null,
}: {
  moduleFlag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const flags = useFeatureFlags();

  if (flags.isPending) {
    return <Loader variant="cards" rows={1} label="Loading module" />;
  }

  if (!flags.isEnabled(moduleFlag)) {
    return (
      fallback ?? (
        <EmptyState
          title="Not available"
          description="This module is not enabled for your school."
        />
      )
    );
  }

  return <>{children}</>;
}
