'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toastError } from '@/lib/toast';
import { TextAreaField } from './fields';

/**
 * Confirm / reason dialog. With `reason` set, a note box is shown and (when `required`)
 * must be filled before the action can be confirmed.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  reason,
  isPending = false,
  error,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  reason?: { label: string; required: boolean };
  isPending?: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ConfirmForm
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          destructive={destructive}
          reason={reason}
          isPending={isPending}
          error={error}
          onConfirm={onConfirm}
          onCancel={() => onOpenChange(false)}
        >
          {children}
        </ConfirmForm>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmForm({
  title,
  description,
  confirmLabel,
  destructive,
  reason,
  isPending,
  error,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  destructive: boolean;
  reason?: { label: string; required: boolean };
  isPending: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const reasonId = useId();
  const [text, setText] = useState('');

  // Server errors surface as a toast; the dialog stays open so the user can retry or dismiss.
  useEffect(() => {
    if (error) toastError('Could not complete action', error);
  }, [error]);

  const blocked = !!reason?.required && text.trim().length === 0;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (blocked || isPending) return;
    onConfirm(text.trim());
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </DialogHeader>
      {children}
      {reason ? (
        <TextAreaField
          id={reasonId}
          label={reason.required ? reason.label : `${reason.label} (optional)`}
          value={text}
          maxLength={500}
          rows={3}
          onChange={(event) => setText(event.target.value)}
        />
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant={destructive ? 'danger' : 'default'} disabled={blocked || isPending}>
          {isPending ? 'Working…' : confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
