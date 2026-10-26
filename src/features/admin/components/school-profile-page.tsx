'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSchoolProfile, useUpdateSchoolProfile } from '../hooks/use-school-profile';
import { QueryState } from '../lib/shared';
import type { SchoolProfile } from '../types';

export function SchoolProfilePage() {
  const profile = useSchoolProfile();
  const form = useForm<SchoolProfile>({
    defaultValues: {
      name: '',
      timezone: 'Africa/Lagos',
      defaultCurrencyCode: 'NGN',
      brandColour: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (!profile.data) return;
    form.reset({
      name: profile.data.name ?? '',
      timezone: profile.data.timezone ?? 'Africa/Lagos',
      defaultCurrencyCode: profile.data.defaultCurrencyCode ?? 'NGN',
      brandColour: profile.data.brandColour ?? '',
      contactEmail: profile.data.contactEmail ?? '',
      contactPhone: profile.data.contactPhone ?? '',
    });
  }, [profile.data, form]);

  const save = useUpdateSchoolProfile();

  return (
    <div className="space-y-5">
      <PageHeader title="School profile" description="Brand, timezone, currency and contact details." />
      <QueryState isPending={profile.isPending} error={profile.error} onRetry={() => void profile.refetch()}>
        <form
          className="grid max-w-xl gap-3 rounded-xl border border-border bg-card p-4"
          onSubmit={form.handleSubmit((v) =>
            save.mutate(v, {
              onSuccess: () => toastSuccess('School profile saved'),
              onError: (e) => toastError('Could not save', e.message),
            }),
          )}
        >
          <Field label="School name">
            <Input {...form.register('name', { required: true })} />
          </Field>
          <Field label="Timezone">
            <Input {...form.register('timezone', { required: true })} placeholder="Africa/Lagos" />
          </Field>
          <Field label="Default currency">
            <Input {...form.register('defaultCurrencyCode', { required: true })} placeholder="NGN" />
          </Field>
          <Field label="Brand colour">
            <Input {...form.register('brandColour')} placeholder="#0F1E36" />
          </Field>
          <Field label="Contact email">
            <Input type="email" {...form.register('contactEmail')} />
          </Field>
          <Field label="Contact phone">
            <Input {...form.register('contactPhone')} />
          </Field>
          <PermissionGate permission="config.profile.update">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save profile'}
            </Button>
          </PermissionGate>
        </form>
      </QueryState>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
