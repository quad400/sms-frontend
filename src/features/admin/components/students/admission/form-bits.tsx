'use client';

import type { LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

export function FormSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
