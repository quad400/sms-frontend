import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export function Alert({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'danger' | 'success' }) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        variant === 'default' && 'border-border bg-muted text-foreground',
        variant === 'danger' && 'border-danger/30 bg-danger/10 text-danger',
        variant === 'success' && 'border-success/30 bg-success/10 text-success',
        className,
      )}
      {...props}
    />
  );
}
