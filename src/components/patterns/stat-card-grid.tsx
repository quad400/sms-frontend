'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { StatCard } from './stat-card';

export function StatCardGrid({
  children,
  skeletonCount = 0,
  className,
}: {
  children?: ReactNode;
  /** When > 0, renders skeleton cards instead of children. */
  skeletonCount?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid grid-cols-12 gap-4', className)}
      aria-busy={skeletonCount > 0 || undefined}
    >
      {skeletonCount > 0
        ? Array.from({ length: skeletonCount }, (_, i) => <StatCard key={i} label="" value="" skeleton />)
        : children}
    </div>
  );
}
