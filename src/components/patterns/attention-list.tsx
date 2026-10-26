'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type AttentionItem = {
  id: string;
  label: string;
  href: string;
  count?: number | null;
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
            className="flex items-center justify-between gap-3 py-2.5 text-sm text-primary hover:underline"
          >
            <span className="min-w-0 truncate">{item.label}</span>
            {item.count != null && item.count > 0 ? (
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
