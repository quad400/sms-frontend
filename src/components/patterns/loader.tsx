import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';

type LoaderVariant = 'page' | 'table' | 'cards' | 'inline';

/**
 * Shared loading skeleton. Use inside `QueryState` or as a Suspense fallback.
 * Prefer this over ad-hoc `animate-pulse` blocks.
 */
export function Loader({
  variant = 'page',
  rows = 3,
  className,
  label = 'Loading',
}: {
  variant?: LoaderVariant;
  /** Row count for `table` / `cards`. */
  rows?: number;
  className?: string;
  label?: string;
}) {
  if (variant === 'inline') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <span className="sr-only">{label}…</span>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-card',
          className,
        )}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-1/4 max-w-40" />
              <Skeleton className="h-3 w-1/5 max-w-28" />
              <Skeleton className="ml-auto h-3 w-16" />
            </div>
          ))}
        </div>
        <span className="sr-only">{label}…</span>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div
        className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}
        role="status"
        aria-busy="true"
        aria-label={label}
      >
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
        <span className="sr-only">{label}…</span>
      </div>
    );
  }

  return (
    <div
      className={cn('space-y-3', className)}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <Skeleton className="h-4 w-28" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <Skeleton className="h-4 w-2/5 max-w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5 max-w-md" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}
