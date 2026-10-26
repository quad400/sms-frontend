import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/patterns/status-badge';
import { cn } from '@/lib/utils/cn';

export function EntityHeader({
  title,
  subtitle,
  status,
  avatar,
  meta,
  actions,
  banner,
  className,
}: {
  title: string;
  subtitle?: string;
  status?: string | null;
  avatar?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  banner?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {banner}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {avatar ?? (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-lg font-semibold text-primary-foreground">
              {title.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">{title}</h1>
              {status ? <StatusBadge status={status} /> : null}
            </div>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
