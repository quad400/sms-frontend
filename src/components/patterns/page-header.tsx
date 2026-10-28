import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function PageHeader({
  title,
  titleAddon,
  description,
  eyebrow,
  actions,
  children,
  className,
}: {
  title: string;
  /** Chip or status next to the title (e.g. Live). */
  titleAddon?: ReactNode;
  description?: string;
  eyebrow?: ReactNode;
  /** Right-side controls aligned with the title on larger screens. */
  actions?: ReactNode;
  /** Content below the title row (e.g. secondary toolbars). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('space-y-4', className)}>
      <div
        className={cn(
          'flex flex-col gap-3',
          actions ? 'md:flex-row md:items-end md:justify-between' : null,
        )}
      >
        <div className="min-w-0 space-y-1">
          {eyebrow ? <div className="mb-1">{eyebrow}</div> : null}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-[30px]">
              {title}
            </h1>
            {titleAddon}
          </div>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}
