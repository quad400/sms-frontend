'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useSendThreadMessage, useThread, useThreads } from '../hooks/use-messages';
import { formatDate, formatDateTime } from '../lib/format';
import { QueryState } from '../lib/shared';

function newClientRef(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ParentMessages() {
  const threads = useThreads();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const rows = useMemo(
    () => [...(threads.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [threads.data],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        description="Conversations with your children’s teachers."
      />

      <QueryState
        isPending={threads.isPending}
        error={threads.error}
        onRetry={() => void threads.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
            <MessageSquare className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm font-medium">No conversations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you or a teacher start a thread, it will appear here.
            </p>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
          <ul
            className={cn(
              'grid content-start gap-2',
              selectedId !== null ? 'hidden md:grid' : undefined,
            )}
            aria-label="Conversations"
          >
            {rows.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  aria-current={thread.id === selectedId ? 'true' : undefined}
                  className={cn(
                    'w-full rounded-2xl border border-border bg-card p-3.5 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-muted/40',
                    thread.id === selectedId && 'border-academic bg-accent-soft',
                  )}
                >
                  <span className="block truncate text-sm font-medium">{thread.subject}</span>
                  <span className="block text-xs text-muted-foreground">
                    Started {formatDate(thread.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className={cn(selectedId === null ? 'hidden md:block' : undefined)}>
            {selectedId === null ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
                Select a conversation to read messages.
              </div>
            ) : (
              <ThreadPane
                threadId={selectedId}
                onBack={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      </QueryState>
    </div>
  );
}

function ThreadPane({ threadId, onBack }: { threadId: number; onBack: () => void }) {
  const thread = useThread(threadId);
  const send = useSendThreadMessage(threadId);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.data?.messages?.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    try {
      await send.mutateAsync({ clientRef: newClientRef(), body: text });
      setBody('');
    } catch (error) {
      toastError('Could not send', error instanceof Error ? error.message : 'Try again.');
    }
  }

  return (
    <div className="flex min-h-[28rem] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Button type="button" variant="ghost" size="icon" className="md:hidden" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <p className="truncate font-medium">{thread.data?.subject ?? 'Conversation'}</p>
      </div>

      <QueryState isPending={thread.isPending} error={thread.error} onRetry={() => void thread.refetch()}>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {(thread.data?.messages ?? []).map((message) => (
            <div key={message.id} className="rounded-xl bg-muted/60 px-3 py-2">
              <p className="whitespace-pre-wrap text-sm">{message.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(message.sentAt)}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </QueryState>

      <form onSubmit={(event) => void onSubmit(event)} className="flex gap-2 border-t border-border p-3">
        <label htmlFor={inputId} className="sr-only">
          Message
        </label>
        <input
          id={inputId}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write a message…"
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button type="submit" disabled={send.isPending || !body.trim()} aria-label="Send">
          <Send className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
