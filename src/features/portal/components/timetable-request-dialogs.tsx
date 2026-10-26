'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { usePostAbsenceRequest, usePostTeacherTicket } from '../hooks/use-portal-timetable-requests';
import type { TimetableSlot } from '../lib/schedule';
import {
  ABSENCE_REASONS,
  FIELD_CLASS,
  MESSAGE_MAX,
  NOTE_MAX,
  OTHER_REASON,
  REASON_MAX,
  requestErrorMessage,
  todayLocal,
} from './timetable/timetable-request-shared';

type RequestDialogProps = {
  slot: TimetableSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AbsenceRequestDialog({ slot, open, onOpenChange }: RequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {slot ? <AbsenceRequestForm slot={slot} onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function AbsenceRequestForm({ slot, onClose }: { slot: TimetableSlot; onClose: () => void }) {
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
        periodLabels: slot.periodLabel ? [slot.periodLabel] : undefined,
      },
      {
        onSuccess: () => {
          toastSuccess('Request sent', 'Your school will review it.');
          onClose();
        },
        onError: (error) => toastError('Could not send request', requestErrorMessage(error)),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Request absence</DialogTitle>
        <DialogDescription>
          Let your school know you will miss {slot.subjectName}
          {slot.periodLabel ? ` (${slot.periodLabel})` : ''}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor={ids.date}>Date</Label>
        <Input
          id={ids.date}
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          disabled={mutation.isPending || mutation.isSuccess}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={ids.reason}>Reason</Label>
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
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={ids.note}>
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id={ids.note}
          rows={3}
          maxLength={NOTE_MAX}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={mutation.isPending || mutation.isSuccess}
          className={cn(FIELD_CLASS, 'resize-none')}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {mutation.isSuccess ? 'Close' : 'Cancel'}
        </Button>
        {mutation.isSuccess ? null : (
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Sending…' : 'Send request'}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}

export function AskTeacherDialog({ slot, open, onOpenChange }: RequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {slot ? <AskTeacherForm slot={slot} onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function AskTeacherForm({ slot, onClose }: { slot: TimetableSlot; onClose: () => void }) {
  const ids = { subject: useId(), message: useId() };
  const mutation = usePostTeacherTicket();
  const [subjectName, setSubjectName] = useState(slot.subjectName);
  const [message, setMessage] = useState('');

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && !mutation.isPending && !mutation.isSuccess;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    const name = subjectName.trim();
    mutation.mutate(
      {
        subjectId: slot.subjectId ?? undefined,
        subjectName: name || undefined,
        message: trimmed,
      },
      {
        onSuccess: () => {
          toastSuccess('Question sent', 'Your teacher will get back to you.');
          onClose();
        },
        onError: (error) => toastError('Could not send question', requestErrorMessage(error)),
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Ask your teacher</DialogTitle>
        <DialogDescription>
          Send a question{slot.teacherName ? ` for ${slot.teacherName}` : ''}. You will get a reply
          from your teacher.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-1.5">
        <Label htmlFor={ids.subject}>Subject</Label>
        <Input
          id={ids.subject}
          maxLength={120}
          value={subjectName}
          onChange={(event) => setSubjectName(event.target.value)}
          disabled={mutation.isPending || mutation.isSuccess}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={ids.message}>Your question</Label>
        <textarea
          id={ids.message}
          rows={5}
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

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {mutation.isSuccess ? 'Close' : 'Cancel'}
        </Button>
        {mutation.isSuccess ? null : (
          <Button type="submit" disabled={!canSubmit}>
            {mutation.isPending ? 'Sending…' : 'Send question'}
          </Button>
        )}
      </DialogFooter>
    </form>
  );
}
