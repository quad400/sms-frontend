'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

/** Display money from minor units (e.g. kobo/cents). */
export function MoneyText({
  minor,
  currency = 'NGN',
  className,
}: {
  minor: number | null | undefined;
  currency?: string;
  className?: string;
}) {
  if (minor == null || !Number.isFinite(minor)) {
    return <span className={cn('font-mono text-muted-foreground', className)}>—</span>;
  }
  const major = minor / 100;
  const formatted = major.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {currency} {formatted}
    </span>
  );
}

/** Input that edits major units but stores/emits minor units. */
export function MoneyInput({
  valueMinor,
  onChangeMinor,
  currency = 'NGN',
  disabled,
  id,
  className,
}: {
  valueMinor: number;
  onChangeMinor: (minor: number) => void;
  currency?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const major = Number.isFinite(valueMinor) ? (valueMinor / 100).toFixed(2) : '';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">{currency}</span>
      <Input
        id={id}
        type="number"
        step="0.01"
        inputMode="decimal"
        disabled={disabled}
        value={major}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) {
            onChangeMinor(0);
            return;
          }
          onChangeMinor(Math.round(n * 100));
        }}
      />
    </div>
  );
}
