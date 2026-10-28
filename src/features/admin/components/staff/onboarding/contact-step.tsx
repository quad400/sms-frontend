'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSaveStaff, useStaffMember } from '../../../hooks/use-staff';
import { QueryState } from '../../../lib/shared';
import { Field, FormSection } from '../../students/admission/form-bits';

type Values = {
  phone: string;
  email: string;
  hireDate: string;
};

export function ContactStep({
  staffId,
  onContinue,
  onSkip,
}: {
  staffId: number;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const existing = useStaffMember(staffId);
  const save = useSaveStaff(staffId);
  const form = useForm<Values>({
    defaultValues: { phone: '', email: '', hireDate: '' },
  });

  useEffect(() => {
    const s = existing.data;
    if (!s) return;
    form.reset({
      phone: s.phone ?? '',
      email: s.email ?? '',
      hireDate: s.hireDate?.slice(0, 10) ?? '',
    });
  }, [existing.data, form]);

  const onSubmit = (values: Values) => {
    save.mutate(
      {
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
        hireDate: values.hireDate || null,
      },
      {
        onSuccess: () => {
          toastSuccess('Contact details saved');
          onContinue();
        },
        onError: (e) => toastError('Could not save contact', e.message),
      },
    );
  };

  return (
    <QueryState
      isPending={existing.isPending}
      error={existing.error}
      onRetry={() => void existing.refetch()}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormSection title="Contact & employment" icon={Phone}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone">
              <Input
                type="tel"
                {...form.register('phone')}
                autoComplete="tel"
                placeholder="Phone number"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                {...form.register('email')}
                autoComplete="email"
                placeholder="work@school.edu"
              />
            </Field>
            <Field label="Hire date">
              <Controller
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select hire date"
                    aria-label="Hire date"
                  />
                )}
              />
            </Field>
          </div>
        </FormSection>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button
            type="submit"
            disabled={save.isPending}
            className="bg-teal-700 hover:bg-teal-800"
          >
            {save.isPending ? 'Saving…' : 'Save & continue'}
          </Button>
        </div>
      </form>
    </QueryState>
  );
}
