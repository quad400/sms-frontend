'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Label / value fact row for profile panels and detail sheets.
 * - `stack` (default): label above value
 * - `inline`: label left, value right
 */
export function Fact({
  label,
  value,
  hint,
  mono,
  layout = 'stack',
  className,
}: {
  label: string;
  value?: ReactNode;
  hint?: ReactNode;
  mono?: boolean;
  layout?: 'stack' | 'inline';
  className?: string;
}) {
  const display =
    value == null || value === ''
      ? '—'
      : typeof value === 'string'
        ? value.trim() || '—'
        : value;

  if (layout === 'inline') {
    return (
      <div className={cn('flex items-baseline justify-between gap-3 text-sm', className)}>
        <span className="shrink-0 text-muted-foreground">{label}</span>
        <div className="min-w-0 text-right">
          <p
            className={cn(
              'truncate font-medium text-foreground',
              mono && 'font-mono text-xs tracking-wide',
            )}
          >
            {display}
          </p>
          {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-sm font-medium text-foreground',
          mono && 'font-mono text-xs tracking-wide',
        )}
      >
        {display}
      </dd>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
