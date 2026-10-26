'use client';

import { cn } from '@/lib/utils/cn';

export type MetricRow = {
  id?: string;
  label: string;
  value: string | number;
  /** 0–1 fraction for optional fill bar */
  fraction?: number;
};

export function MetricList({
  rows,
  emptyLabel = 'No data yet',
  className,
  maxRows = 8,
}: {
  rows: MetricRow[];
  emptyLabel?: string;
  className?: string;
  maxRows?: number;
}) {
  const slice = rows.slice(0, maxRows);
  if (slice.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className={cn('space-y-2.5', className)}>
      {slice.map((row, i) => (
        <li key={row.id ?? `${row.label}-${i}`} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">{row.label}</span>
            <span className="shrink-0 font-medium tabular-nums">{row.value}</span>
          </div>
          {row.fraction != null ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${Math.min(100, Math.max(0, row.fraction * 100))}%` }}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
