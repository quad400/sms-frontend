'use client';

import type { ReactNode } from 'react';
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
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!flags.isEnabled(moduleFlag)) {
    return (
      fallback ?? (
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="font-heading text-xl font-semibold text-foreground">Not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This module is not enabled for your school.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
