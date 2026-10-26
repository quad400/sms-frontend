'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  Plane,
} from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useStaffCalendar } from '../hooks/use-staff-calendar';
import {
  SCHEDULE_KIND_META,
  type MonthCursor,
  type ScheduleItem,
  type ScheduleKind,
} from '../lib/calendar-schedule';
import { formatLongDate, localToday } from '../lib/format';
import { QueryState } from '../lib/shared';
import { EmptyPanel } from './shared/panel';
import { StatusBadge } from './shared/status-badge';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const KIND_ICON: Record<ScheduleKind, typeof BookOpen> = {
  class: BookOpen,
  holiday: PartyPopper,
  leave: Plane,
  activity: CalendarDays,
};

function pad(day: number): string {
  return String(day).padStart(2, '0');
}

function kindsOnDay(items: ScheduleItem[]): ScheduleKind[] {
  const seen = new Set<ScheduleKind>();
  const order: ScheduleKind[] = ['holiday', 'leave', 'activity', 'class'];
  for (const item of items) seen.add(item.kind);
  return order.filter((kind) => seen.has(kind));
}

export function StaffCalendar() {
  const today = localToday();
  const initial = useMemo<MonthCursor>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);
  const [cursor, setCursor] = useState<MonthCursor>(initial);
  const [selected, setSelected] = useState(today);

  const calendar = useStaffCalendar(cursor);
  const monthPrefix = calendar.from.slice(0, 8);
  const leading = (new Date(cursor.year, cursor.month, 1).getDay() + 6) % 7;
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const selectedInMonth = selected.startsWith(monthPrefix);
  const activeDate = selectedInMonth ? selected : calendar.from;
  const dayItems = calendar.itemsFor(activeDate);

  function shift(delta: number): void {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    const nextCursor = { year: next.getFullYear(), month: next.getMonth() };
    const nextPrefix = `${nextCursor.year}-${String(nextCursor.month + 1).padStart(2, '0')}-`;
    setCursor(nextCursor);
    setSelected((current) => (current.startsWith(nextPrefix) ? current : `${nextPrefix}01`));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendar"
        description="Your classes, leave, holidays and school activities for the month."
      />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-card)]">
        <Button type="button" variant="ghost" size="icon" aria-label="Previous month" onClick={() => shift(-1)}>
          <ChevronLeft />
        </Button>
        <p className="font-heading text-lg font-semibold" aria-live="polite">
          {monthLabel}
        </p>
        <Button type="button" variant="ghost" size="icon" aria-label="Next month" onClick={() => shift(1)}>
          <ChevronRight />
        </Button>
      </div>

      <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(Object.keys(SCHEDULE_KIND_META) as ScheduleKind[]).map((kind) => (
          <li key={kind} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2 rounded-full', SCHEDULE_KIND_META[kind].dot)} aria-hidden />
            {SCHEDULE_KIND_META[kind].label}
          </li>
        ))}
      </ul>

      <QueryState
        isPending={calendar.isPending}
        error={calendar.error}
        onRetry={calendar.refetch}
      >
        <section
          aria-label={`${monthLabel} schedule`}
          className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] md:p-5"
        >
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAY_HEADERS.map((day) => (
              <p
                key={day}
                className="pb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </p>
            ))}
            {Array.from({ length: leading }, (_, i) => (
              <div key={`pad-${i}`} aria-hidden />
            ))}
            {Array.from({ length: calendar.days }, (_, i) => {
              const day = i + 1;
              const date = `${monthPrefix}${pad(day)}`;
              const items = calendar.itemsFor(date);
              const kinds = kindsOnDay(items);
              const isToday = date === today;
              const isSelected = date === activeDate;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelected(date)}
                  aria-label={`${formatLongDate(date)}${items.length ? `, ${items.length} items` : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors',
                    isSelected
                      ? 'bg-brand text-brand-foreground'
                      : isToday
                        ? 'bg-muted font-semibold text-foreground ring-1 ring-border'
                        : items.length > 0
                          ? 'bg-muted/50 text-foreground hover:bg-muted'
                          : 'text-muted-foreground hover:bg-muted/40',
                  )}
                >
                  <span className="font-mono font-semibold tabular-nums">{day}</span>
                  {kinds.length > 0 ? (
                    <span className="flex items-center justify-center gap-0.5">
                      {kinds.slice(0, 3).map((kind) => (
                        <span
                          key={kind}
                          className={cn(
                            'size-1.5 rounded-full',
                            isSelected ? 'bg-brand-foreground/90' : SCHEDULE_KIND_META[kind].dot,
                          )}
                          aria-hidden
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="size-1.5" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label={`Schedule for ${formatLongDate(activeDate)}`} className="space-y-3">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            {formatLongDate(activeDate)}
          </h2>
          {dayItems.length === 0 ? (
            <EmptyPanel
              icon={CalendarOff}
              title="Nothing scheduled"
              description="No classes, leave, holidays or activities on this day."
            />
          ) : (
            <ul className="grid gap-2">
              {dayItems.map((item) => (
                <ScheduleRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </section>
      </QueryState>
    </div>
  );
}

function ScheduleRow({ item }: { item: ScheduleItem }) {
  const meta = SCHEDULE_KIND_META[item.kind];
  const Icon = KIND_ICON[item.kind];
  const body = (
    <>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', meta.chip)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium">{item.title}</span>
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              meta.chip,
            )}
          >
            {item.kindLabel ?? meta.label}
          </span>
          {item.status ? <StatusBadge status={item.status} /> : null}
        </span>
        {item.timeLabel ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.timeLabel}</span>
        ) : null}
        {item.detail ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.detail}</span>
        ) : null}
      </span>
    </>
  );

  const className =
    'flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-colors';

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className={cn(className, 'hover:bg-muted/60')}>
          {body}
        </Link>
      </li>
    );
  }

  return <li className={className}>{body}</li>;
}
