'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-24 w-full rounded-sm border bg-input border-border bg-card px-3 py-2 text-sm text-foreground transition-colors',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
