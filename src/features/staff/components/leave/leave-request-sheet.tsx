'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCreateLeaveRequest, useLeaveTypes } from '../../hooks/use-leave';
import { inclusiveDays, localToday, plural } from '../../lib/format';
import { leaveRequestSchema, type LeaveRequestValues } from '../../schemas';
import { SelectField, TextAreaField } from '../shared/fields';

export function LeaveRequestSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <LeaveForm onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function LeaveForm({ onDone }: { onDone: () => void }) {
  const ids = { type: useId(), start: useId(), end: useId(), reason: useId() };
  const types = useLeaveTypes();
  const create = useCreateLeaveRequest();
  const today = localToday();

  const form = useForm<LeaveRequestValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { leaveTypeId: '', startDate: today, endDate: today, reason: '' },
  });
  const { errors } = form.formState;
  const start = form.watch('startDate');
  const end = form.watch('endDate');
  const days = start && end && end >= start ? inclusiveDays(start, end) : null;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        leaveTypeId: Number(values.leaveTypeId),
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim() === '' ? undefined : values.reason.trim(),
      });
      toastSuccess('Leave request sent', 'Your request has been sent to the school for approval.');
      onDone();
    } catch (error) {
      toastError('Could not send request', error instanceof Error ? error.message : 'Could not send the request.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col gap-4">
      <SheetHeader>
        <SheetTitle>Request leave</SheetTitle>
        <SheetDescription>Your request goes to the school for approval.</SheetDescription>
      </SheetHeader>

      <SelectField
        id={ids.type}
        label="Leave type"
        disabled={types.isPending}
        hint={errors.leaveTypeId?.message ?? (types.error ? 'Leave types could not be loaded.' : undefined)}
        {...form.register('leaveTypeId')}
      >
        <option value="">Select type</option>
        {(types.data ?? []).map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={ids.start}>From</Label>
          <Input id={ids.start} type="date" min={today} {...form.register('startDate')} />
          {errors.startDate ? <p className="text-xs text-danger">{errors.startDate.message}</p> : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={ids.end}>To</Label>
          <Input id={ids.end} type="date" min={start || today} {...form.register('endDate')} />
          {errors.endDate ? <p className="text-xs text-danger">{errors.endDate.message}</p> : null}
        </div>
      </div>
      {days ? <p className="text-sm text-muted-foreground">{plural(days, 'day')} requested</p> : null}

      <TextAreaField
        id={ids.reason}
        label="Reason (optional)"
        rows={4}
        hint={errors.reason?.message}
        {...form.register('reason')}
      />


      <div className="mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Sending…' : 'Send request'}
        </Button>
      </div>
    </form>
  );
}
