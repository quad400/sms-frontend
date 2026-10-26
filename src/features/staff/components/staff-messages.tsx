'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useSendThreadMessage, useThread, useThreads } from '../hooks/use-communication';
import { formatDate, formatDateTime } from '../lib/format';
import { QueryState } from '../lib/shared';
import { CONTROL_CLASS } from './shared/fields';
import { EmptyPanel } from './shared/panel';

function newClientRef(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function StaffMessages() {
  const threads = useThreads();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const rows = useMemo(
    () => [...(threads.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [threads.data],
  );
  const activeId = selectedId;

  return (
    <div className="space-y-5">
      <PageHeader title="Messages" description="Conversations with parents and guardians." />

      <QueryState
        isPending={threads.isPending}
        error={threads.error}
        onRetry={() => void threads.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={MessageSquare}
            title="No conversations yet"
            description="When a parent or guardian starts a conversation with you, it will show up here."
          />
        }
      >
        <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
          <ul
            className={cn(
              'grid content-start gap-2',
              activeId !== null ? 'hidden md:grid' : undefined,
            )}
            aria-label="Conversations"
          >
            {rows.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  aria-current={thread.id === activeId ? 'true' : undefined}
                  className={cn(
                    'w-full rounded-2xl border border-border bg-card p-3.5 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    thread.id === activeId && 'border-academic bg-accent-soft',
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

          <div className={cn(activeId === null ? 'hidden md:block' : undefined)}>
            {activeId === null ? (
              <EmptyPanel
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation on the left to read and reply."
              />
            ) : (
              <ThreadView key={activeId} threadId={activeId} onBack={() => setSelectedId(null)} />
            )}
          </div>
        </div>
      </QueryState>
    </div>
  );
}

function ThreadView({ threadId, onBack }: { threadId: number; onBack: () => void }) {
  const inputId = useId();
  const { user, can } = useSession();
  const thread = useThread(threadId);
  const send = useSendThreadMessage(threadId);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  // One ref per attempt: a retry of the same text must not duplicate the message.
  const pendingRef = useRef<{ text: string; clientRef: string } | null>(null);

  const messages = thread.data?.messages;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages?.length]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || send.isPending) return;
    if (pendingRef.current?.text !== text) pendingRef.current = { text, clientRef: newClientRef() };
    send.mutate(
      { clientRef: pendingRef.current.clientRef, body: text },
      {
        onSuccess: () => {
          pendingRef.current = null;
          setDraft('');
        },
        onError: (error) => toastError('Message not sent', error.message),
      },
    );
  }

  return (
    <section className="flex min-h-[24rem] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <header className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
        <h2 className="truncate font-heading text-base font-semibold">
          {thread.data?.subject ?? 'Conversation'}
        </h2>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <QueryState
          isPending={thread.isPending}
          error={thread.error}
          onRetry={() => void thread.refetch()}
          isEmpty={(messages?.length ?? 0) === 0}
          empty={<p className="py-8 text-center text-sm text-muted-foreground">No messages yet.</p>}
        >
          {(messages ?? []).map((message) => {
            const mine = message.senderUserId === user?.id;
            return (
              <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'bg-academic text-academic-foreground' : 'bg-muted text-foreground',
                  )}
                >
                  <p className="whitespace-pre-line break-words">{message.body}</p>
                  <p className={cn('mt-1 text-[11px]', mine ? 'opacity-80' : 'text-muted-foreground')}>
                    {formatDateTime(message.sentAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </QueryState>
        <div ref={endRef} />
      </div>

      {can('communication.message.send') ? (
        <form onSubmit={onSubmit} className="space-y-2 border-t border-border p-3">
          <div className="flex items-end gap-2">
            <label htmlFor={inputId} className="sr-only">
              Reply
            </label>
            <textarea
              id={inputId}
              rows={2}
              value={draft}
              maxLength={5000}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onSubmit(event);
              }}
              placeholder="Write a reply…"
              className={cn(CONTROL_CLASS, 'min-h-10 resize-none py-2')}
            />
            <Button type="submit" disabled={!draft.trim() || send.isPending} aria-label="Send reply">
              <Send className="size-4" aria-hidden />
              <span className="hidden sm:inline">{send.isPending ? 'Sending…' : 'Send'}</span>
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
