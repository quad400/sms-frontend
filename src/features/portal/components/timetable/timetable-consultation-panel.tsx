'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { usePostTeacherTicket } from '../../hooks/use-portal-timetable-requests';
import type { TimetableSlot } from '../../lib/schedule';
import { FIELD_CLASS, MESSAGE_MAX, requestErrorMessage } from './timetable-request-shared';

export function TimetableConsultationPanel({
  contextSlot,
}: {
  contextSlot: TimetableSlot | null;
}) {
  const ids = { subject: useId(), message: useId() };
  const mutation = usePostTeacherTicket();
  const [subjectName, setSubjectName] = useState(contextSlot?.subjectName ?? '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (contextSlot?.subjectName) setSubjectName(contextSlot.subjectName);
  }, [contextSlot?.key, contextSlot?.subjectName]);

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && !mutation.isPending && !mutation.isSuccess;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    const name = subjectName.trim();
    mutation.mutate(
      {
        subjectId: contextSlot?.subjectId ?? undefined,
        subjectName: name || undefined,
        message: trimmed,
      },
      {
        onSuccess: () => toastSuccess('Question sent', 'Your teacher will get back to you.'),
        onError: (error) => toastError('Could not send question', requestErrorMessage(error)),
      },
    );
  }

  function reset() {
    mutation.reset();
    setMessage('');
    setSubjectName(contextSlot?.subjectName ?? '');
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/70 w-full px-4 py-4 md:px-5">
        <div className="min-w-0 space-y-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-academic/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-academic">
                Academic ticket
              </span>
              <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-800">
                Open inquiry
              </span>
            </div>
            <div>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                aria-hidden
              >
                <MessageCircle className="size-4" />
              </span>
            </div>
          </div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Academic Consultation
          </h2>
          <p className="text-sm text-muted-foreground">
            Send a question to your teacher. Replies come through school channels.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-4 md:p-5">
        {contextSlot ? (
          <div className="flex items-start gap-3 rounded-xl bg-sky-50 px-3.5 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {(contextSlot.teacherName || contextSlot.subjectName || '?')
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('') || '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {contextSlot.teacherName || 'Teacher to be confirmed'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {[contextSlot.subjectName, contextSlot.roomName, contextSlot.periodLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
            Select a period from the timetable to prefill teacher and subject, or type them below.
          </p>
        )}

        <div className="grid gap-1.5">
          <Label htmlFor={ids.subject}>Subject</Label>
          <Input
            id={ids.subject}
            maxLength={120}
            value={subjectName}
            onChange={(event) => setSubjectName(event.target.value)}
            disabled={mutation.isPending || mutation.isSuccess}
            placeholder="e.g. Mathematics"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={ids.message}>Your question</Label>
          <textarea
            id={ids.message}
            rows={4}
            required
            maxLength={MESSAGE_MAX}
            placeholder="What would you like help with?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={mutation.isPending || mutation.isSuccess}
            className={cn(FIELD_CLASS, 'resize-none')}
          />
          <p className="text-right text-xs tabular-nums text-muted-foreground">
            {message.length}/{MESSAGE_MAX}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={reset} disabled={mutation.isPending}>
            {mutation.isSuccess ? 'New ticket' : 'Clear'}
          </Button>
          {mutation.isSuccess ? null : (
            <Button type="submit" disabled={!canSubmit}>
              <Send className="size-4" aria-hidden />
              {mutation.isPending ? 'Sending…' : 'Send ticket'}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
