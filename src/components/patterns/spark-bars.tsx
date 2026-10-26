'use client';

import { cn } from '@/lib/utils/cn';

export type SparkPoint = {
  value: number;
  label?: string;
};

export function SparkBars({
  points,
  emptyLabel = 'No data yet',
  className,
  maxBars = 14,
}: {
  points: SparkPoint[];
  emptyLabel?: string;
  className?: string;
  maxBars?: number;
}) {
  const slice = points.slice(-maxBars);
  if (slice.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  const max = Math.max(...slice.map((p) => p.value), 1);
  return (
    <div className={cn('flex h-28 items-end gap-1', className)} role="img" aria-label="Trend chart">
      {slice.map((p, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-primary/70"
          style={{ height: `${Math.max(8, (p.value / max) * 100)}%` }}
          title={p.label ? `${p.label}: ${p.value}` : String(p.value)}
        />
      ))}
    </div>
  );
}
