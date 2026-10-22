'use client';

import type { ReactNode } from 'react';
import { PortalApiError } from '../api/portal-api';

export function QueryState({
  isPending,
  error,
  children,
  empty,
  isEmpty,
}: {
  isPending: boolean;
  error: unknown;
  children: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
}) {
  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (error) {
    const message =
      error instanceof PortalApiError ? error.message : 'Could not load this page. Please try again.';
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        {message}
      </div>
    );
  }

  if (isEmpty) {
    return (
      empty ?? (
        <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing to show yet.
        </p>
      )
    );
  }

  return <>{children}</>;
}
