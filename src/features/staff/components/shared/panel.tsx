import type { ReactNode } from 'react';
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
