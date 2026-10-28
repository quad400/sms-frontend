'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils/cn';

const ISO_DATE = 'yyyy-MM-dd';

function parseIsoDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value.slice(0, 10), ISO_DATE, new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
  id,
  'aria-label': ariaLabel,
  fromYear,
  toYear,
  captionLayout = 'dropdown',
  allowClear = false,
}: {
  /** ISO date string `yyyy-MM-dd`. */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
  fromYear?: number;
  toYear?: number;
  captionLayout?: React.ComponentProps<typeof Calendar>['captionLayout'];
  allowClear?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(value);
  const now = new Date();
  const startYear = fromYear ?? now.getFullYear() - 80;
  const endYear = toYear ?? now.getFullYear() + 5;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            'group flex h-10 w-full items-center gap-2.5 rounded-lg border border-border bg-background px-3 text-left text-sm outline-none transition',
            'hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            open && ' bg-card ring-1 ring-ring',
            className,
          )}
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-md transition',
              selected
                ? 'bg-academic text-academic-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-accent-soft group-hover:text-accent-soft-foreground',
            )}
          >
            <CalendarIcon className="size-3.5" aria-hidden />
          </span>
          <span
            className={cn(
              'min-w-0 flex-1 truncate font-medium',
              selected ? 'text-foreground' : 'font-normal text-muted-foreground',
            )}
          >
            {selected ? format(selected, 'd MMM yyyy') : placeholder}
          </span>
          {allowClear && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear date"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                }
              }}
            >
              <X className="size-3.5" />
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden rounded-2xl border-border p-0 shadow-[var(--shadow-popover)]"
        align="start"
        sideOffset={8}
      >
        <div className="border-b border-border bg-[linear-gradient(160deg,color-mix(in_oklab,var(--academic)_12%,transparent),transparent_70%)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {selected ? 'Selected' : 'Choose a date'}
          </p>
          <p className="mt-0.5 font-heading text-lg font-medium tracking-tight text-foreground">
            {selected ? format(selected, 'EEEE, d MMM yyyy') : placeholder}
          </p>
        </div>
        <Calendar
          mode="single"
          captionLayout={captionLayout}
          selected={selected}
          defaultMonth={selected}
          startMonth={new Date(startYear, 0)}
          endMonth={new Date(endYear, 11)}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
