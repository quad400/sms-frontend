'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Banknote,
  BookMarked,
  GraduationCap,
  HeartPulse,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';
import { cn } from '@/lib/utils/cn';

type ActionChip = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  moduleFlag?: string;
  tone: 'amber' | 'blue' | 'green' | 'rose' | 'slate';
};

const ACTIONS: ActionChip[] = [
  {
    id: 'library',
    label: 'Library Books',
    hint: 'Loans & holds',
    href: '/student/library',
    icon: BookMarked,
    moduleFlag: STUDENT_MODULE_FLAGS.library,
    tone: 'blue',
  },
  {
    id: 'dispatches',
    label: 'Class Notices',
    hint: 'Campus dispatches',
    href: '/student/announcements',
    icon: Megaphone,
    tone: 'green',
  },
  {
    id: 'fees',
    label: 'Bursary Ledger',
    hint: 'Fee summary',
    href: '/student/fees',
    icon: Banknote,
    tone: 'slate',
  },
  {
    id: 'medical',
    label: 'Health File',
    hint: 'Clinic records',
    href: '/student/medical',
    icon: HeartPulse,
    moduleFlag: STUDENT_MODULE_FLAGS.health,
    tone: 'rose',
  },
  {
    id: 'results',
    label: 'Terminal Results',
    hint: 'Gradebook',
    href: '/student/results',
    icon: GraduationCap,
    tone: 'amber',
  },
];

const TONE: Record<ActionChip['tone'], { icon: string; accent: string }> = {
  amber: {
    icon: 'bg-amber-100 text-amber-800',
    accent: 'group-hover:border-amber-200 group-hover:bg-amber-50/60',
  },
  blue: {
    icon: 'bg-sky-100 text-sky-800',
    accent: 'group-hover:border-sky-200 group-hover:bg-sky-50/60',
  },
  green: {
    icon: 'bg-academic/12 text-academic',
    accent: 'group-hover:border-academic/30 group-hover:bg-academic/5',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-800',
    accent: 'group-hover:border-rose-200 group-hover:bg-rose-50/60',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700',
    accent: 'group-hover:border-slate-200 group-hover:bg-slate-50/70',
  },
};

export function HomeActionCenter({
  isModuleEnabled,
}: {
  isModuleEnabled: (flag: string) => boolean;
}) {
  const visible = ACTIONS.filter(
    (action) => !action.moduleFlag || isModuleEnabled(action.moduleFlag),
  );

  if (visible.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/70 px-4 py-4 md:px-6">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Action Center & Registry Notices
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Items requiring student attention this term.
          </p>
        </div>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {visible.length} modules
        </span>
      </div>

      <div
        className={cn(
          'grid gap-px bg-border/70',
          visible.length >= 5
            ? 'sm:grid-cols-2 lg:grid-cols-5'
            : visible.length === 4
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : visible.length === 3
                ? 'sm:grid-cols-3'
                : 'sm:grid-cols-2',
        )}
      >
        {visible.map((action) => {
          const Icon = action.icon;
          const tone = TONE[action.tone];
          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                'group relative flex flex-col bg-card px-4 py-5 transition-colors',
                'focus-visible:z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                tone.accent,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                    tone.icon,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span
                  aria-hidden
                  className="flex size-7 items-center justify-center rounded-full text-muted-foreground/50 transition-all group-hover:bg-background group-hover:text-foreground group-hover:shadow-sm"
                >
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold leading-snug">{action.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.hint}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
