'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const inputClassName = cn(
  'flex h-10 w-full rounded-sm border bg-input border-border bg-card px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]',
  '[&:-webkit-autofill]:[box-shadow:inset_0_0_0_1000px_var(--card)]',
  '[&:-webkit-autofill]:[transition:background-color_99999s_ease-out_0s]',
  '[&:-webkit-autofill:hover]:[box-shadow:inset_0_0_0_1000px_var(--card)]',
  '[&:-webkit-autofill:focus]:[box-shadow:inset_0_0_0_1000px_var(--card)]',
  '[&:-webkit-autofill:active]:[box-shadow:inset_0_0_0_1000px_var(--card)]',
);

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type = 'text', ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const isPassword = type === 'password';

    if (!isPassword) {
      return <input type={type} className={cn(inputClassName, className)} ref={ref} {...props} />;
    }

    return (
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          className={cn(inputClassName, 'pr-10', className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={props.disabled}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
    );
  },
);
Input.displayName = 'Input';
