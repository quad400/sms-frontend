'use client';

import { useState } from 'react';
import { Bell, CheckCheck, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { QueryState } from '../lib/shared';
import {
  useAdminInbox,
  useMarkAdminInboxRead,
  useMarkAllAdminInboxRead,
} from '../hooks/use-notifications';

function formatCreatedAt(value: string, timeZone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(date);
  }
}

export function AdminNotifications({ timeZone }: { timeZone: string }) {
  const [page, setPage] = useState(1);
  const inbox = useAdminInbox(page);
  const markRead = useMarkAdminInboxRead();
  const markAll = useMarkAllAdminInboxRead();

  const rows = inbox.data?.data ?? [];
  const meta = inbox.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;
  const hasNotifications = (meta?.total ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="School and system updates for your administrator account."
        actions={
          hasNotifications ? (
            <Button
              type="button"
              variant="outline"
              disabled={markAll.isPending}
              onClick={() =>
                markAll.mutate(undefined, {
                  onError: (error) => toastError('Could not mark all as read', error.message),
                })
              }
            >
              <CheckCheck aria-hidden />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <QueryState
        isPending={inbox.isPending}
        error={inbox.error}
        onRetry={() => void inbox.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-[var(--shadow-card)]">
              <Bell className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">You’re all caught up</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              New school and system updates will appear here.
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          <ul className="space-y-3">
            {rows.map((item) => {
              const isUnread = !item.readAt;
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:gap-4 md:p-5',
                    isUnread && 'border-academic/40 bg-accent-soft/60',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
                      isUnread ? 'bg-academic/10 text-academic' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isUnread ? (
                      <Bell className="size-4" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      {isUnread ? <Badge variant="soft">Unread</Badge> : null}
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                    <time
                      dateTime={item.createdAt}
                      className="block pt-1 font-mono text-xs tabular-nums text-text-tertiary"
                    >
                      {formatCreatedAt(item.createdAt, timeZone)}
                    </time>
                  </div>
                  {isUnread ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={markRead.isPending}
                      onClick={() =>
                        markRead.mutate(item.id, {
                          onError: (error) => toastError('Could not mark as read', error.message),
                        })
                      }
                    >
                      Mark read
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {totalPages > 1 ? (
            <nav className="flex items-center justify-between gap-3" aria-label="Notification pages">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Page <span className="font-mono tabular-nums">{page}</span> of{' '}
                <span className="font-mono tabular-nums">{totalPages}</span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </div>
      </QueryState>
    </div>
  );
}
