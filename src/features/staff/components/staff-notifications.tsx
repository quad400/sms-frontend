'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useInbox, useMarkAllInboxRead, useMarkInboxRead } from '../hooks/use-notifications';
import { formatDateTime } from '../lib/format';
import { QueryState } from '../lib/shared';
import { EmptyPanel } from './shared/panel';

export function StaffNotifications() {
  const [page, setPage] = useState(1);
  const inbox = useInbox(page);
  const markRead = useMarkInboxRead();
  const markAll = useMarkAllInboxRead();

  const rows = inbox.data?.data ?? [];
  const meta = inbox.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;
  const unread = rows.filter((row) => !row.readAt).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Updates from the school and your classes."
        actions={
          unread > 0 ? (
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
              <CheckCheck className="size-4" aria-hidden />
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
          <EmptyPanel
            icon={Bell}
            title="You’re all caught up"
            description="New notifications will show up here."
          />
        }
      >
        <ul className="grid gap-2">
          {rows.map((item) => {
            const isUnread = !item.readAt;
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]',
                  isUnread && 'border-academic/40 bg-accent-soft',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-1.5 size-2 shrink-0 rounded-full',
                    isUnread ? 'bg-academic' : 'bg-transparent',
                  )}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium">
                    {item.title}
                    {isUnread ? <span className="sr-only"> (unread)</span> : null}
                  </p>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
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
          <nav className="mt-4 flex items-center justify-between" aria-label="Pagination">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </nav>
        ) : null}
      </QueryState>
    </div>
  );
}
