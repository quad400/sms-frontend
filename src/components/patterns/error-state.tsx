import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

/**
 * Shared error / failed-load panel. Prefer this over custom dashed boxes.
 */
export function ErrorState({
  title = 'Couldn’t load this',
  description = 'Something went wrong. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  action,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** Extra actions below the retry button (or instead of it). */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
        <AlertCircle className="size-5" aria-hidden />
      </span>
      <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
