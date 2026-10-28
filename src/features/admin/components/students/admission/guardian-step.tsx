'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import { useLinkStudentGuardian } from '../../../hooks/use-students';
import { RELATIONSHIP_CODES } from '../../../lib/codes';
import { Textarea } from '@/components/ui/textarea';
import { Field, FormSection } from './form-bits';

type Values = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  relationshipCode: string;
  address: string;
  occupation: string;
  isPrimaryContact: boolean;
  canPickUp: boolean;
  isFeePayer: boolean;
};

const emptyValues: Values = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  relationshipCode: 'guardian',
  address: '',
  occupation: '',
  isPrimaryContact: true,
  canPickUp: true,
  isFeePayer: true,
};

export function GuardianStep({
  studentId,
  onContinue,
  onSkip,
}: {
  studentId: number;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const link = useLinkStudentGuardian(studentId);
  const [linkedCount, setLinkedCount] = useState(0);

  const form = useForm<Values>({ defaultValues: emptyValues });

  const saveGuardian = (values: Values, thenContinue: boolean) => {
    link.mutate(
      {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim() || undefined,
        email: values.email.trim() || undefined,
        relationshipCode: values.relationshipCode,
        address: values.address.trim() || undefined,
        occupation: values.occupation.trim() || undefined,
        isPrimaryContact: values.isPrimaryContact,
        canPickUp: values.canPickUp,
        isFeePayer: values.isFeePayer,
      },
      {
        onSuccess: () => {
          const next = linkedCount + 1;
          setLinkedCount(next);
          toastSuccess(next === 1 ? 'Guardian linked' : 'Another guardian linked');
          if (thenContinue) {
            onContinue();
          } else {
            form.reset({
              ...emptyValues,
              isPrimaryContact: false,
              isFeePayer: false,
            });
          }
        },
        onError: (e) => toastError('Could not link guardian', e.message),
      },
    );
  };

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((v) => saveGuardian(v, true))}
    >
      <FormSection title="Guardian details" icon={Users}>
        {linkedCount > 0 ? (
          <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
            {linkedCount} guardian{linkedCount === 1 ? '' : 's'} linked. Add another or continue.
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" required error={form.formState.errors.firstName?.message}>
            <Input {...form.register('firstName', { required: 'Required' })} />
          </Field>
          <Field label="Last name" required error={form.formState.errors.lastName?.message}>
            <Input {...form.register('lastName', { required: 'Required' })} />
          </Field>
          <Field label="Phone" required error={form.formState.errors.phone?.message}>
            <Input
              type="tel"
              {...form.register('phone', { required: 'Required' })}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email">
            <Input type="email" {...form.register('email')} autoComplete="email" />
          </Field>
          <Field label="Relationship" required>
            <Controller
              control={form.control}
              name="relationshipCode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Relationship">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_CODES.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Occupation">
            <Input {...form.register('occupation')} />
          </Field>
          <Field label="Address" hint="Optional home or work address.">
            <Textarea rows={3} {...form.register('address')} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <Flag
            checked={form.watch('isPrimaryContact')}
            onCheckedChange={(v) => form.setValue('isPrimaryContact', v)}
            label="Primary contact"
          />
          <Flag
            checked={form.watch('canPickUp')}
            onCheckedChange={(v) => form.setValue('canPickUp', v)}
            label="Can pick up"
          />
          <Flag
            checked={form.watch('isFeePayer')}
            onCheckedChange={(v) => form.setValue('isFeePayer', v)}
            label="Fee payer"
          />
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={link.isPending}
            onClick={form.handleSubmit((v) => saveGuardian(v, false))}
          >
            Save & add another
          </Button>
          <Button
            type="submit"
            disabled={link.isPending}
            className="bg-teal-700 hover:bg-teal-800"
          >
            {link.isPending ? 'Saving…' : 'Save & continue'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Flag({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      {label}
    </label>
  );
}
