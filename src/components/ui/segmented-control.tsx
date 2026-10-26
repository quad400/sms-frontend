'use client';

import { cn } from '@/lib/utils/cn';

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  'aria-label': ariaLabel,
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  'aria-label': string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex w-fit max-w-full shrink-0 rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {options.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'min-w-max flex-1 basis-0 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
