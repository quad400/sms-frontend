'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Compact metadata chip for entity headers (class, campus, age, etc.). */
export function MetaChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
