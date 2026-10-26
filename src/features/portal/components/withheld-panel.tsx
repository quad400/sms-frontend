import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { WITHHELD_COPY } from '../lib/format';

/** Dignified, neutral panel shown instead of results. Never shows money UI. */
export function WithheldPanel({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-4 rounded-2xl border border-border bg-muted px-5 py-6 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground">
        <ShieldAlert className="size-5" aria-hidden />
      </span>
      <p className="text-sm font-medium leading-6 text-foreground">{WITHHELD_COPY}</p>
    </div>
  );
}
