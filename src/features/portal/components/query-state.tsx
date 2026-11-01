'use client';

import { useEffect, type ReactNode } from 'react';
import { EmptyState } from '@/components/patterns/empty-state';
import { ErrorState } from '@/components/patterns/error-state';
import { Loader } from '@/components/patterns/loader';
import { ApiClientError } from '@/lib/api/errors';
import { toastError } from '@/lib/toast';

export function QueryState({
  isPending,
  error,
  children,
  empty,
  isEmpty,
  onRetry,
  loaderVariant = 'page',
}: {
  isPending: boolean;
  error: unknown;
  children: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
  onRetry?: () => void;
  /** Skeleton layout while pending. */
  loaderVariant?: 'page' | 'table' | 'cards' | 'inline';
}) {
  const errorMessage = error
    ? error instanceof ApiClientError
      ? error.message
      : 'Could not load this page. Please try again.'
    : null;

  // Toast once per distinct message; the inline retry area below stays put.
  useEffect(() => {
    if (errorMessage) toastError('Couldn’t load this', errorMessage);
  }, [errorMessage]);

  if (isPending) {
    return <Loader variant={loaderVariant} />;
  }

  if (error) {
    return (
      <ErrorState
        description={errorMessage ?? undefined}
        onRetry={onRetry}
      />
    );
  }

  if (isEmpty) {
    return empty ?? <EmptyState />;
  }

  return <>{children}</>;
}
