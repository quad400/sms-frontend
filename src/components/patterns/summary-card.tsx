'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Compact metric tile used on directory / module summary strips. */
export function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
  children,
  className,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  iconClass?: string;
  valueClass?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4',
            iconClass,
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          'mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums text-foreground',
          valueClass,
        )}
      >
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}
