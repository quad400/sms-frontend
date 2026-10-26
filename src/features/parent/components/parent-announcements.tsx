'use client';

import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { useAnnouncements } from '../hooks/use-portal-feed';
import { formatDate } from '../lib/format';
import { QueryState } from '../lib/shared';

export function ParentAnnouncements() {
  const announcements = useAnnouncements();
  const rows = announcements.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="Announcements" description="School notices for your family." />

      <QueryState
        isPending={announcements.isPending}
        error={announcements.error}
        onRetry={() => void announcements.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <Megaphone className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">No announcements</p>
            <p className="mt-1 text-sm text-muted-foreground">New notices will appear here.</p>
          </div>
        }
      >
        <ul className="grid gap-2">
          {rows.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <p className="font-medium">{item.title}</p>
              {item.publishedAt ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>
              ) : null}
              {item.body ? (
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}
