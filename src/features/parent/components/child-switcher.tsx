'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { childName } from '../lib/format';
import { useActiveChild } from '../hooks/use-active-child';

export function ChildSwitcher({ className }: { className?: string }) {
  const { children, activeChild, selectChild, isPending } = useActiveChild();

  if (isPending || children.length <= 1 || !activeChild) return null;

  return (
    <label className={cn('relative inline-flex min-w-0 max-w-[12rem] items-center', className)}>
      <span className="sr-only">Select child</span>
      <select
        value={activeChild.id}
        onChange={(event) => selectChild(Number(event.target.value))}
        className="h-9 w-full appearance-none truncate rounded-lg border border-border bg-muted/70 py-1.5 pl-3 pr-8 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic"
        aria-label="Active child"
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {childName(child)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 size-4 text-muted-foreground"
        aria-hidden
      />
    </label>
  );
}
