'use client';

import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** Entity / profile shortcut card with icon, label, hint, and chevron. */
export function QuickLink({
  href,
  icon: Icon,
  label,
  hint,
  className,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 shadow-[var(--shadow-card)] transition hover:border-teal-200 hover:bg-teal-50/40',
        className,
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition group-hover:text-teal-700" />
    </Link>
  );
}
