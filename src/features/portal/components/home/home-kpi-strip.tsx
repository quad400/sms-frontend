'use client';

import { Lock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type HomeKpi = {
  id: string;
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  badge?: string;
  locked?: boolean;
  accent?: 'default' | 'academic' | 'amber';
};

export function HomeKpiStrip({ items }: { items: HomeKpi[] }) {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.id}
            className="min-w-[160px] shrink-0 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:min-w-0"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              {Icon ? (
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground',
                    // item.accent === 'academic' && 'bg-academic/10 text-academic',
                    // item.accent === 'amber' && 'bg-amber-100 text-amber-700',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {item.locked ? (
                <Lock className="size-4 text-muted-foreground" aria-hidden />
              ) : null}
              <p
                className={cn(
                  'font-mono text-2xl font-semibold tabular-nums tracking-tight',
                  item.accent === 'academic' && 'text-academic',
                  item.accent === 'amber' && 'text-amber-700',
                )}
              >
                {item.value}
              </p>
            </div>
            {item.badge ? (
              <span className="mt-2 inline-flex rounded-lg bg-academic/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-academic">
                {item.badge}
              </span>
            ) : null}
            {item.hint ? <p className="mt-2 text-xs text-muted-foreground">{item.hint}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
