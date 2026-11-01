'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Plus, Trash2, Users } from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { toastError, toastSuccess } from '@/lib/toast';
import type { LinkedGuardian } from '../../../api/students';
import {
  useLinkStudentGuardian,
  useStudentGuardians,
  useUnlinkStudentGuardian,
  useUpdateStudentGuardian,
} from '../../../hooks/use-students';
import { RELATIONSHIP_CODES } from '../../../lib/codes';
import { QueryState } from '../../../lib/shared';
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

const emptyValues = (asPrimary: boolean): Values => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  relationshipCode: 'guardian',
  address: '',
  occupation: '',
  isPrimaryContact: asPrimary,
  canPickUp: true,
  isFeePayer: asPrimary,
});

function valuesFromGuardian(g: LinkedGuardian): Values {
  return {
    firstName: g.firstName ?? '',
    lastName: g.lastName ?? '',
    phone: g.phone ?? '',
    email: g.email ?? '',
    relationshipCode: g.relationship || 'guardian',
    address: g.address ?? '',
    occupation: g.occupation ?? '',
    isPrimaryContact: g.isPrimaryContact ?? false,
    canPickUp: g.canPickUp ?? true,
    isFeePayer: g.isFeePayer ?? false,
  };
}

export function GuardianStep({
  studentId,
  mode = 'create',
  onContinue,
  onSkip,
}: {
  studentId: number;
  mode?: 'create' | 'edit';
  onContinue: () => void;
  onSkip: () => void;
}) {
  const linked = useStudentGuardians(studentId);
  const existing = linked.data ?? [];
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormKey, setNewFormKey] = useState(0);

  useEffect(() => {
    if (linked.isPending) return;
    // Always show a blank form when there are no guardians yet.
    if ((linked.data?.length ?? 0) === 0) {
      setShowNewForm(true);
    }
  }, [linked.isPending, linked.data?.length]);

  const openNewForm = () => {
    setNewFormKey((k) => k + 1);
    setShowNewForm(true);
  };

  return (
    <QueryState
      isPending={linked.isPending}
      error={linked.error}
      onRetry={() => void linked.refetch()}
    >
      <div className="space-y-4">
        {existing.map((g, index) => (
          <GuardianDetailsForm
            key={g.id}
            studentId={studentId}
            mode={mode}
            guardian={g}
            title={
              g.isPrimaryContact
                ? 'Primary guardian'
                : `Guardian ${index + 1}`
            }
            onSaved={() => void linked.refetch()}
            onRemoved={() => void linked.refetch()}
          />
        ))}

        {showNewForm ? (
          <GuardianDetailsForm
            key={`new-${newFormKey}`}
            studentId={studentId}
            mode={mode}
            guardian={null}
            title={existing.length === 0 ? 'Guardian details' : 'New guardian'}
            defaultPrimary={existing.length === 0}
            onSaved={() => {
              void linked.refetch();
              setShowNewForm(false);
            }}
            onCancel={
              existing.length > 0
                ? () => setShowNewForm(false)
                : undefined
            }
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            {existing.length > 0 ? 'Continue without changes' : 'Skip for now'}
          </Button>
          <div className="flex flex-wrap gap-2">
            {!showNewForm ? (
              <Button type="button" variant="outline" onClick={openNewForm}>
                <Plus className="size-4" />
                Add another guardian
              </Button>
            ) : null}
            <Button
              type="button"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={onContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </QueryState>
  );
}

function GuardianDetailsForm({
  studentId,
  mode,
  guardian,
  title,
  defaultPrimary = false,
  onSaved,
  onRemoved,
  onCancel,
}: {
  studentId: number;
  mode: 'create' | 'edit';
  guardian: LinkedGuardian | null;
  title: string;
  defaultPrimary?: boolean;
  onSaved: () => void;
  onRemoved?: () => void;
  onCancel?: () => void;
}) {
  const link = useLinkStudentGuardian(studentId);
  const updateLinked = useUpdateStudentGuardian(studentId);
  const unlink = useUnlinkStudentGuardian(studentId);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isExisting = guardian != null;

  const form = useForm<Values>({
    defaultValues: guardian
      ? valuesFromGuardian(guardian)
      : emptyValues(defaultPrimary),
  });

  useEffect(() => {
    if (!guardian) return;
    form.reset(valuesFromGuardian(guardian));
  }, [guardian, form]);

  const saving = link.isPending || updateLinked.isPending || unlink.isPending;

  const onSubmit = (values: Values) => {
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      relationshipCode: values.relationshipCode,
      address: values.address.trim() || undefined,
      occupation: values.occupation.trim() || undefined,
      isPrimaryContact: values.isPrimaryContact,
      canPickUp: values.canPickUp,
      isFeePayer: values.isFeePayer,
    };

    if (guardian) {
      updateLinked.mutate(
        {
          guardianId: guardian.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          email: payload.email ?? null,
          address: payload.address ?? null,
          occupation: payload.occupation ?? null,
          relationshipCode: payload.relationshipCode,
          isPrimaryContact: payload.isPrimaryContact,
          canPickUp: payload.canPickUp,
          isFeePayer: payload.isFeePayer,
        },
        {
          onSuccess: () => {
            toastSuccess(mode === 'edit' ? 'Guardian updated' : 'Guardian saved');
            onSaved();
          },
          onError: (e) => toastError('Could not update guardian', e.message),
        },
      );
      return;
    }

    link.mutate(
      {
        ...payload,
        phone: payload.phone || undefined,
      },
      {
        onSuccess: () => {
          toastSuccess('Guardian linked');
          onSaved();
        },
        onError: (e) => toastError('Could not link guardian', e.message),
      },
    );
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection title={title} icon={Users}>
        {isExisting ? (
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900">
            Linked guardian, save changes to update this record.
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
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {isExisting ? (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            {onCancel ? (
              <Button type="button" variant="ghost" disabled={saving} onClick={onCancel}>
                Cancel
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {saving && !unlink.isPending ? 'Saving…' : 'Save guardian'}
            </Button>
          </div>
        </div>
      </FormSection>

      {guardian ? (
        <ConfirmDialog
          open={confirmRemove}
          onOpenChange={setConfirmRemove}
          title="Remove guardian?"
          description="This unlinks the guardian from the student. The guardian record itself is kept."
          confirmLabel="Remove"
          destructive
          isPending={unlink.isPending}
          onConfirm={() =>
            unlink.mutate(guardian.id, {
              onSuccess: () => {
                toastSuccess('Guardian removed');
                setConfirmRemove(false);
                onRemoved?.();
              },
              onError: (e) => toastError('Could not remove guardian', e.message),
            })
          }
        />
      ) : null}
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
