'use client';

import { cn } from '@/lib/utils/cn';

export type MetricSegment = {
  key: string;
  fraction: number;
  className?: string;
};

export type MetricRow = {
  id?: string;
  label: string;
  value: string | number;
  /** 0–1 fraction for optional fill bar */
  fraction?: number;
  cap?: number | null;
  segments?: MetricSegment[];
  /** Override default bar fill colour */
  barClassName?: string;
  /** Emphasise the value (e.g. over capacity) */
  valueClassName?: string;
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
    <ul className={cn('space-y-3', className)}>
      {slice.map((row, i) => {
        const numeric = typeof row.value === 'number' ? row.value : null;
        const valueLabel =
          numeric != null && row.cap != null && row.cap > 0
            ? `${numeric.toLocaleString()} / ${row.cap.toLocaleString()} Cap`
            : String(row.value);
        const segs = (row.segments ?? []).filter((s) => s.fraction > 0);
        const barFill = row.barClassName ?? 'bg-emerald-500/80';
        return (
          <li key={row.id ?? `${row.label}-${i}`} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-muted-foreground">{row.label}</span>
              <span
                className={cn(
                  'shrink-0 font-medium tabular-nums text-foreground',
                  row.valueClassName,
                )}
              >
                {valueLabel}
              </span>
            </div>
            {segs.length > 0 ? (
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                {segs.map((seg) => (
                  <div
                    key={seg.key}
                    className={cn('h-full bg-emerald-500/80', seg.className)}
                    style={{ width: `${Math.min(100, Math.max(0, seg.fraction * 100))}%` }}
                  />
                ))}
              </div>
            ) : row.fraction != null ? (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', barFill)}
                  style={{ width: `${Math.min(100, Math.max(0, row.fraction * 100))}%` }}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
