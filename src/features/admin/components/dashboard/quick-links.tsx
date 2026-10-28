'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { SectionCard } from '@/components/patterns/section-card';
import { cn } from '@/lib/utils/cn';

export type QuickLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'brand' | 'slate';
};

const ACCENT: Record<NonNullable<QuickLink['accent']>, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  sky: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
  rose: 'bg-rose-50 text-rose-700',
  brand: 'bg-accent-soft text-accent-soft-foreground',
  slate: 'bg-slate-100 text-slate-600',
};

export function QuickLinks({ links }: { links: QuickLink[] }) {
  if (links.length === 0) return null;
  return (
    <SectionCard
      title="Quick links"
      description="Immediate shortcuts for common administrator workflows"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {links.map((l, i) => {
          const accent =
            l.accent ??
            (['emerald', 'sky', 'amber', 'violet', 'rose', 'brand', 'slate'] as const)[i % 7]!;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-center text-sm font-medium text-foreground transition hover:border-brand/40 hover:bg-muted/40"
            >
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl',
                  ACCENT[accent],
                )}
              >
                <l.icon className="size-5" />
              </span>
              {l.label}
            </Link>
          );
        })}
      </div>
    </SectionCard>
  );
}
