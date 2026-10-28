'use client';

import { cn } from '@/lib/utils/cn';
import type { SparkPoint } from './spark-bars';

export function SparkLine({
  points,
  target,
  emptyLabel = 'No data yet',
  className,
  maxPoints = 14,
}: {
  points: SparkPoint[];
  target?: number | null;
  emptyLabel?: string;
  className?: string;
  maxPoints?: number;
}) {
  const slice = points.slice(-maxPoints);
  if (slice.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const values = slice.map((p) => p.value);
  const dataMax = Math.max(...values, target ?? 0, 1);
  const yMax = dataMax <= 100 ? 100 : dataMax;
  const w = 100;
  const h = 56;
  const pad = 2;

  const xAt = (i: number) =>
    slice.length === 1 ? w / 2 : pad + (i / (slice.length - 1)) * (w - pad * 2);
  const yAt = (v: number) => h - pad - (v / yMax) * (h - pad * 2);

  const d = slice
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(2)} ${yAt(p.value).toFixed(2)}`)
    .join(' ');

  const last = slice[slice.length - 1]!;
  const firstLabel = slice[0]?.label;
  const lastLabel = last.label;

  return (
    <div className={cn('space-y-2', className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-36 w-full overflow-visible text-primary"
        role="img"
        aria-label="Trend chart"
      >
        {target != null && target > 0 ? (
          <line
            x1={pad}
            x2={w - pad}
            y1={yAt(target)}
            y2={yAt(target)}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="2 2"
            strokeWidth={0.6}
          />
        ) : null}
        <path d={d} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
        {slice.map((p, i) => (
          <circle
            key={i}
            cx={xAt(i)}
            cy={yAt(p.value)}
            r={i === slice.length - 1 ? 1.6 : 1.1}
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span className="truncate">{firstLabel ?? ''}</span>
        {target != null ? (
          <span className="shrink-0 tabular-nums">Target {target}%</span>
        ) : (
          <span />
        )}
        <span className="truncate font-medium tabular-nums text-primary">
          {lastLabel ? `${lastLabel} (${last.value}%)` : `${last.value}%`}
        </span>
      </div>
    </div>
  );
}
