'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function StatCard({
  label,
  value,
  hint,
  href,
  updated,
  skeleton,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  updated?: string | null;
  skeleton?: boolean;
  className?: string;
}) {
  if (skeleton) {
    return (
      <div
        className={cn(
          'h-[6.5rem] animate-pulse rounded-xl border border-border bg-muted/60',
          className,
        )}
        aria-hidden
      />
    );
  }

  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      {updated ? <p className="mt-1 text-xs text-muted-foreground">{updated}</p> : null}
    </>
  );

  const shell =
    'rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition';

  if (href) {
    return (
      <Link
        href={href}
        className={cn(shell, 'block hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
      >
        {body}
      </Link>
    );
  }

  return <div className={cn(shell, className)}>{body}</div>;
}
