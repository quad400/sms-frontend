'use client';

import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
} from 'react-day-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-card p-4 [--cell-size:2.5rem]',
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-3', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-3', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 rounded-full text-muted-foreground hover:bg-accent-soft hover:text-academic',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 rounded-full text-muted-foreground hover:bg-accent-soft hover:text-academic',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-8 w-full items-center justify-center px-10',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-8 w-full items-center justify-center gap-2 text-sm font-semibold',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative rounded-lg border border-border bg-background px-2 py-1 shadow-none transition hover:border-academic/40 hover:bg-accent-soft',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'absolute inset-0 cursor-pointer opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'select-none font-heading text-sm font-semibold tracking-tight',
          captionLayout === 'label'
            ? 'text-foreground'
            : 'flex h-8 items-center gap-1 text-foreground [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('mb-1 flex gap-1', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 select-none rounded-md py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
          defaultClassNames.weekday,
        ),
        week: cn('mt-1 flex w-full gap-1', defaultClassNames.week),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center',
          defaultClassNames.day,
        ),
        today: cn(defaultClassNames.today),
        outside: cn(
          'text-muted-foreground/50 aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-muted-foreground opacity-40',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', chevronClassName)} {...chevronProps} />
            );
          }
          if (orientation === 'right') {
            return (
              <ChevronRightIcon className={cn('size-4', chevronClassName)} {...chevronProps} />
            );
          }
          return (
            <ChevronDownIcon className={cn('size-3.5', chevronClassName)} {...chevronProps} />
          );
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: DayButtonProps) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-today={modifiers.today || undefined}
      className={cn(
        'flex aspect-square size-[--cell-size] min-w-[--cell-size] flex-col items-center justify-center rounded-full px-3 py-2 text-sm font-medium leading-none transition',
        'hover:bg-accent-soft hover:text-accent-soft-foreground',
        'data-[today]:bg-muted data-[today]:text-foreground',
        'data-[selected-single=true]:bg-academic data-[selected-single=true]:text-academic-foreground',
        'data-[selected-single=true]:hover:bg-academic/90 data-[selected-single=true]:hover:text-academic-foreground',
        'group-data-[focused=true]/day:ring-1 group-data-[focused=true]/day:ring-ring',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}
