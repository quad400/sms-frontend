'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function SectionCard({
  title,
  description,
  action,
  actionClassName,
  badge,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string } | ReactNode;
  actionClassName?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const actionNode =
    action && typeof action === 'object' && 'href' in action && 'label' in action ? (
      <Link
        className={cn(
          'text-sm font-medium text-primary hover:underline',
          actionClassName,
        )}
        href={action.href}
      >
        {action.label}
      </Link>
    ) : (
      action
    );

  return (
    <section className={cn('rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
            {badge}
          </div>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {actionNode ? <div className="shrink-0">{actionNode}</div> : null}
      </div>
      {children}
    </section>
  );
}
