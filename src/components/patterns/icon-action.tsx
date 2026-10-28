'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

type Shared = {
  label: string;
  icon: ReactNode;
  className?: string;
  disabled?: boolean;
};

/** Icon-only action control — always include a visible-to-AT `label`. */
export function IconActionButton({
  label,
  icon,
  className,
  disabled,
  ...props
}: Shared & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'type'>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('size-8 text-muted-foreground hover:text-foreground', className)}
      aria-label={label}
      title={label}
      disabled={disabled}
      {...props}
    >
      {icon}
    </Button>
  );
}

export function IconActionLink({
  label,
  icon,
  href,
  className,
}: Shared & { href: string }) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn('size-8 text-muted-foreground hover:text-foreground', className)}
    >
      <Link href={href} aria-label={label} title={label}>
        {icon}
      </Link>
    </Button>
  );
}
