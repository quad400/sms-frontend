'use client';

import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
  className,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      {onSearchChange ? (
        <div className="min-w-[12rem] flex-1">
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel = 'All',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  emptyLabel?: string;
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      <span>{label}</span>
      <select
        className="h-10 min-w-[8rem] rounded-md border border-border bg-background px-2 text-sm text-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
