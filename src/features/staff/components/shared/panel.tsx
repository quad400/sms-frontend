import type { ComponentType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'min-w-0 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5',
        className,
      )}
    >
      {title || actions ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            {title ? (
              <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Dashed empty state for lists that loaded fine but have no rows. */
export function EmptyPanel({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center',
        className,
      )}
    >
      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
