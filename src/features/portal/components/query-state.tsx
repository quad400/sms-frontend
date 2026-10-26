'use client';

import { useEffect, type ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { ApiClientError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';

export function QueryState({
  isPending,
  error,
  children,
  empty,
  isEmpty,
  onRetry,
}: {
  isPending: boolean;
  error: unknown;
  children: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
  onRetry?: () => void;
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
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading">
        <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="h-4 w-2/5 max-w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-3 w-4/5 max-w-md animate-pulse rounded-md bg-muted" />
          </div>
        ))}
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center"
      >
        <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <AlertCircle className="size-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-foreground">Couldn’t load this</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{errorMessage}</p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (isEmpty) {
    return (
      empty ?? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Inbox className="size-5" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            When there’s something new, it’ll show up here.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
