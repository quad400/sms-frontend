import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/** Low-level pulse placeholder. Prefer `Loader` from patterns for page/table layouts. */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
