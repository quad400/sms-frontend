'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { childPath } from '@/components/shells/parent-nav';
import { useInbox, useMarkAllInboxRead, useMarkInboxRead } from '../hooks/use-notifications';
import { formatDateTime } from '../lib/format';
import { QueryState } from '../lib/shared';

export function ParentNotifications() {
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
        description="Alerts from the school about your children."
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
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">You’re all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">New notifications will show up here.</p>
          </div>
        }
      >
        <ul className="grid gap-2">
          {rows.map((item) => {
            const isUnread = !item.readAt;
            const studentId = item.meta?.studentId;
            const date = item.meta?.date;
            const attendanceHref =
              studentId && (item.meta?.type === 'absence' || /absent/i.test(item.title + item.body))
                ? childPath(studentId, '/attendance')
                : null;
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
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  {attendanceHref ? (
                    <Link
                      href={attendanceHref}
                      className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
                      onClick={() => {
                        if (isUnread) markRead.mutate(item.id);
                      }}
                    >
                      View attendance{date ? ` for ${date}` : ''}
                    </Link>
                  ) : null}
                </div>
                {isUnread ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      markRead.mutate(item.id, {
                        onError: (error) => toastError('Could not mark read', error.message),
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
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}
