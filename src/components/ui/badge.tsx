import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex whitespace-nowrap items-center rounded-full border font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand text-brand-foreground',
        secondary: 'border-transparent bg-muted text-muted-foreground',
        outline: 'border-border text-foreground',
        soft: 'border-transparent bg-accent-soft text-accent-soft-foreground',
        success: 'border-transparent bg-success/15 text-success',
        danger: 'border-transparent bg-danger/15 text-danger',
        /** Soft pastel tones for dense tables / status chips */
        successSoft: 'border-transparent bg-emerald-50 text-emerald-800',
        warning: 'border-transparent bg-amber-50 text-amber-900',
        dangerSoft: 'border-transparent bg-rose-50 text-rose-800',
        info: 'border-transparent bg-sky-50 text-sky-800',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs font-medium',
        sm: 'max-w-[11rem] px-2.5 py-1 text-[11px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
