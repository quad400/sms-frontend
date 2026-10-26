'use client';

import { useId, useState, type FormEvent } from 'react';
import { CheckCircle2, CloudUpload, Send, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { usePostAbsenceRequest } from '../../hooks/use-portal-timetable-requests';
import type { TimetableSlot } from '../../lib/schedule';
import {
  ABSENCE_REASONS,
  FIELD_CLASS,
  NOTE_MAX,
  OTHER_REASON,
  REASON_MAX,
  requestErrorMessage,
  todayLocal,
} from './timetable-request-shared';

export function TimetableAbsencePanel({
  contextSlot,
}: {
  contextSlot: TimetableSlot | null;
}) {
  const ids = { date: useId(), reason: useId(), custom: useId(), note: useId() };
  const mutation = usePostAbsenceRequest();
  const [date, setDate] = useState(todayLocal);
  const [reasonChoice, setReasonChoice] = useState<string>(ABSENCE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [note, setNote] = useState('');

  const reason = (reasonChoice === OTHER_REASON ? customReason : reasonChoice).trim();
  const canSubmit = date !== '' && reason.length > 0 && !mutation.isPending && !mutation.isSuccess;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      {
        date,
        reason,
        note: note.trim() || undefined,
        periodLabels: contextSlot?.periodLabel ? [contextSlot.periodLabel] : undefined,
      },
      {
        onSuccess: () => toastSuccess('Request sent', 'Your school will review it.'),
        onError: (error) => toastError('Could not send request', requestErrorMessage(error)),
      },
    );
  }

  function reset() {
    mutation.reset();
    setDate(todayLocal());
    setReasonChoice(ABSENCE_REASONS[0]);
    setCustomReason('');
    setNote('');
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-4 md:px-5">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-academic/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-academic">
            <CheckCircle2 className="size-3" aria-hidden />
            Form ready
          </span>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Request Absence & Leave Voucher
          </h2>
          <p className="text-sm text-muted-foreground">
            Notify the school when you will miss class
            {contextSlot ? ` · context: ${contextSlot.subjectName}` : ''}.
          </p>
        </div>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <Shield className="size-4" />
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-4 md:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor={ids.date}>Date of planned absence</Label>
            <Input
              id={ids.date}
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={mutation.isPending || mutation.isSuccess}
            />
            <p className="text-xs text-muted-foreground">
              {contextSlot?.periodLabel
                ? `Linked to ${contextSlot.periodLabel}`
                : 'Applies to the selected school day'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={ids.reason}>Voucher reason</Label>
            <select
              id={ids.reason}
              value={reasonChoice}
              onChange={(event) => setReasonChoice(event.target.value)}
              disabled={mutation.isPending || mutation.isSuccess}
              className={cn(FIELD_CLASS, 'h-10')}
            >
              {ABSENCE_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {reasonChoice === OTHER_REASON ? (
              <Input
                id={ids.custom}
                aria-label="Describe your reason"
                placeholder="Tell us briefly why"
                maxLength={REASON_MAX}
                value={customReason}
                onChange={(event) => setCustomReason(event.target.value)}
                disabled={mutation.isPending || mutation.isSuccess}
              />
            ) : (
              <p className="text-xs text-muted-foreground">School office will review this request.</p>
            )}
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={ids.note}>
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id={ids.note}
            rows={2}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={mutation.isPending || mutation.isSuccess}
            className={cn(FIELD_CLASS, 'resize-none')}
          />
        </div>

        <div
          className="rounded-xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-5 text-center"
          aria-disabled
        >
          <CloudUpload className="mx-auto size-6 text-violet-400" aria-hidden />
          <p className="mt-2 text-sm font-medium text-foreground">Attachments coming soon</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Supporting documents cannot be uploaded yet — submit the request without a file.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={reset} disabled={mutation.isPending}>
            {mutation.isSuccess ? 'New request' : 'Reset'}
          </Button>
          {mutation.isSuccess ? null : (
            <Button type="submit" disabled={!canSubmit} className="bg-academic text-academic-foreground hover:bg-academic/90">
              <Send className="size-4" aria-hidden />
              {mutation.isPending ? 'Sending…' : 'Submit voucher'}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
