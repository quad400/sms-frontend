'use client';

import { CalendarDays, Download } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useEvents } from '../hooks/use-portal-feed';
import { eventToIcsHref } from '../lib/ics';
import { formatDate, formatDateTime, statusLabel } from '../lib/format';
import { QueryState } from '../lib/shared';

export function ParentEvents() {
  const events = useEvents();
  const rows = events.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="Events" description="School holidays, activities and key dates." />

      <QueryState
        isPending={events.isPending}
        error={events.error}
        onRetry={() => void events.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <CalendarDays className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">No events</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upcoming school events will be listed here.
            </p>
          </div>
        }
      >
        <ul className="grid gap-2">
          {rows.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{event.title}</p>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                    {statusLabel(event.eventType)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {/T\d{2}:\d{2}/.test(event.startsAt)
                    ? formatDateTime(event.startsAt)
                    : formatDate(event.startsAt)}
                  {event.location ? ` · ${event.location}` : ''}
                </p>
                {event.description ? (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const href = eventToIcsHref(event);
                  const a = document.createElement('a');
                  a.href = href;
                  a.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
                  a.click();
                  URL.revokeObjectURL(href);
                }}
              >
                <Download className="size-4" aria-hidden />
                Add to calendar
              </Button>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}
