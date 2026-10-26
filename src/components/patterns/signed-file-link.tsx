'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/** Open a backend-signed URL in a new tab — never invent PDF content in the browser. */
export function SignedFileLink({
  href,
  children,
  className,
}: {
  href: string | null | undefined;
  children: ReactNode;
  className?: string;
}) {
  if (!href) {
    return <span className={cn('text-sm text-muted-foreground', className)}>No file</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-sm font-medium text-primary hover:underline', className)}
    >
      {children}
    </a>
  );
}
