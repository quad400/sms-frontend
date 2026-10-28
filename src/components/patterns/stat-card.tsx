'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type StatCardAccent =
  | 'default'
  | 'brand'
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'slate';

const ACCENT: Record<StatCardAccent, string> = {
  default: 'bg-muted text-muted-foreground',
  brand: 'bg-accent-soft text-accent-soft-foreground',
  emerald: 'bg-emerald-50 text-emerald-700',
  sky: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({
  label,
  value,
  hint,
  href,
  updated,
  icon,
  accent = 'default',
  tone = 'default',
  skeleton,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  updated?: string | null;
  icon?: ReactNode;
  accent?: StatCardAccent;
  tone?: 'default' | 'warning';
  skeleton?: boolean;
  className?: string;
}) {
  if (skeleton) {
    return (
      <div
        className={cn(
          'h-[7.5rem] animate-pulse rounded-xl border border-border bg-muted/60',
          className,
        )}
        aria-hidden
      />
    );
  }

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl [&_svg]:size-4',
              ACCENT[accent],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          'mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums',
          tone === 'warning' ? 'text-amber-700' : 'text-foreground',
        )}
      >
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div> : null}
      {updated ? <p className="mt-1 text-xs text-muted-foreground">{updated}</p> : null}
    </>
  );

  const shell =
    'rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition';

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          shell,
          'block hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={cn(shell, className)}>{body}</div>;
}
