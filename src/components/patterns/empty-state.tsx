import type { ComponentType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Shared empty list / no-data panel. Prefer this over one-off empty copy blocks.
 */
export function EmptyState({
  title = 'Nothing here yet',
  description = 'When there’s something new, it’ll show up here.',
  icon: Icon = Inbox,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl',
        'border border-dashed border-border/80 bg-card px-6 py-12 text-center'
        ,
        className,
      )}
    >
      {/* Soft brand wash — keeps empty panels from looking like flat placeholders */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(15,118,110,0.08),transparent_55%)]"
      />

      <div className="relative flex flex-col items-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-50/90 ring-1 ring-teal-700/10">
          <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
            <Icon className="size-5" aria-hidden />
          </span>
        </div>

        <p className="font-heading text-base font-semibold tracking-tight text-foreground">
          {title}
        </p>
        {description ? (
          <p className="mt-1.5 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
