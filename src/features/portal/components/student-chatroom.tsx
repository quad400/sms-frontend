'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { usePortalChatChannels, usePortalChatMessages } from '../hooks/use-portal-chat';
import { QueryState } from './query-state';
import { asArray, asRecord, str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '../lib/format';

export function StudentChatroom() {
  const channelsQuery = usePortalChatChannels();
  const channels = asArray(channelsQuery.data);
  const [channelId, setChannelId] = useState<string | null>(null);
  const activeId = channelId ?? (str(asRecord(channels[0])?.id) || null);
  const messagesQuery = usePortalChatMessages(activeId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Scholar Collaboration Lounge"
        description="Monitored class channels for study groups and announcements."
      />

      <QueryState isPending={channelsQuery.isPending} error={channelsQuery.error} isEmpty={channels.length === 0}>
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Class channels
            </p>
            <ul className="space-y-1">
              {channels.map((row, index) => {
                const channel = asRecord(row);
                const id = str(channel?.id, String(index));
                const active = id === activeId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setChannelId(id)}
                      className={cn(
                        'flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                        active
                          ? 'bg-academic text-academic-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      #{str(channel?.slug ?? channel?.name, 'channel')}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="border-b border-border px-4 py-3">
              <p className="font-semibold">
                #{str(asRecord(channels.find((c) => str(asRecord(c)?.id) === activeId))?.name, 'channel')}
              </p>
              <p className="text-xs text-muted-foreground">Safe school moderated</p>
            </div>
            <QueryState
              isPending={messagesQuery.isPending}
              error={messagesQuery.error}
              isEmpty={asArray(messagesQuery.data).length === 0}
            >
              <ul className="flex-1 space-y-3 overflow-y-auto p-4">
                {asArray(messagesQuery.data).map((row, index) => {
                  const msg = asRecord(row);
                  const author = asRecord(msg?.author);
                  return (
                    <li key={str(msg?.id, String(index))} className="rounded-xl bg-muted/50 px-3 py-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {str(author?.displayName, 'Scholar')} ·{' '}
                        <span className="font-mono font-normal tabular-nums">{formatDateTime(msg?.createdAt)}</span>
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{str(msg?.body)}</p>
                    </li>
                  );
                })}
              </ul>
            </QueryState>
          </section>
        </div>
      </QueryState>
    </div>
  );
}
