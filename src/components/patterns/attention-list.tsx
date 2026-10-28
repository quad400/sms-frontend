'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type AttentionItem = {
  id: string;
  label: string;
  href: string;
  count?: number | null;
  detail?: string | null;
  actionLabel?: string | null;
};

export function AttentionList({
  items,
  emptyLabel = 'Nothing needs attention right now.',
  className,
}: {
  items: AttentionItem[];
  emptyLabel?: string;
  className?: string;
}) {
  if (items.length === 0) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{emptyLabel}</p>;
  }
  return (
    <ul className={cn('divide-y divide-border/70', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-start justify-between gap-3 py-3 text-sm hover:bg-muted/40"
          >
            <span className="min-w-0">
              <span className="block font-medium text-foreground">
                {item.count != null && item.count > 1 ? `${item.count} ` : null}
                {item.label}
              </span>
              {item.detail ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
              ) : null}
            </span>
            {item.actionLabel ? (
              <span className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                {item.actionLabel}
              </span>
            ) : item.count != null && item.count > 0 ? (
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                {item.count}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
