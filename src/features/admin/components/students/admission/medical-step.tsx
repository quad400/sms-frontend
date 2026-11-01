'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ApiClientError } from '@/lib/api/errors';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSaveStudentMedical, useStudentMedical } from '../../../hooks/use-students';
import { QueryState } from '../../../lib/shared';
import { Field, FormSection } from './form-bits';

type Values = {
  allergies: string;
  conditions: string;
  medications: string;
  emergencyNotes: string;
};

function toFormValues(m: {
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  emergencyNotes: string | null;
}): Values {
  return {
    allergies: m.allergies ?? '',
    conditions: m.conditions ?? '',
    medications: m.medications ?? '',
    emergencyNotes: m.emergencyNotes ?? '',
  };
}

function toApiBody(values: Values) {
  // PUT replaces all four fields; empty → null (matches MedicalCryptoService.encryptNullable).
  return {
    allergies: values.allergies.trim() || null,
    conditions: values.conditions.trim() || null,
    medications: values.medications.trim() || null,
    emergencyNotes: values.emergencyNotes.trim() || null,
  };
}

export function MedicalStep({
  studentId,
  onContinue,
  onSkip,
}: {
  studentId: number;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const existing = useStudentMedical(studentId);
  const save = useSaveStudentMedical(studentId);
  const form = useForm<Values>({
    defaultValues: {
      allergies: '',
      conditions: '',
      medications: '',
      emergencyNotes: '',
    },
  });

  // Allow saving even when the operator cannot read existing medical records.
  const loadBlocked =
    existing.error instanceof ApiClientError && existing.error.mapped.kind === 'page';

  useEffect(() => {
    const m = existing.data;
    if (!m) return;
    form.reset(toFormValues(m));
  }, [existing.data, form]);

  const onSubmit = (values: Values) => {
    const body = toApiBody(values);
    const current = existing.data;
    const unchanged =
      current != null &&
      (current.allergies ?? null) === body.allergies &&
      (current.conditions ?? null) === body.conditions &&
      (current.medications ?? null) === body.medications &&
      (current.emergencyNotes ?? null) === body.emergencyNotes;

    if (unchanged) {
      onContinue();
      return;
    }

    save.mutate(body, {
      onSuccess: (row) => {
        form.reset(toFormValues(row));
        toastSuccess('Medical info saved');
        onContinue();
      },
      onError: (e) => toastError('Could not save medical info', e.message),
    });
  };

  const updatedLabel = existing.data?.updatedAt
    ? new Date(existing.data.updatedAt).toLocaleString()
    : null;

  return (
    <QueryState
      isPending={existing.isPending && !loadBlocked}
      error={loadBlocked ? null : existing.error}
      onRetry={() => void existing.refetch()}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormSection title="Health information" icon={HeartPulse}>
          {/* <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Access to medical details is logged for compliance.
          </p> */}
          {loadBlocked ? (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              Existing medical notes could not be loaded. New values will replace them on save.
            </p>
          ) : null}
          {updatedLabel && !loadBlocked ? (
            <p className="text-[11px] text-muted-foreground">Last updated {updatedLabel}</p>
          ) : null}
          <Field label="Allergies">
            <Textarea
              rows={3}
              placeholder="e.g. peanuts, penicillin"
              {...form.register('allergies')}
            />
          </Field>
          <Field label="Conditions">
            <Textarea
              rows={3}
              placeholder="e.g. asthma, epilepsy"
              {...form.register('conditions')}
            />
          </Field>
          <Field label="Medications">
            <Textarea
              rows={3}
              placeholder="Current medications and dosage notes"
              {...form.register('medications')}
            />
          </Field>
          <Field label="Emergency notes">
            <Textarea
              rows={3}
              placeholder="Anything staff should know in an emergency"
              {...form.register('emergencyNotes')}
            />
          </Field>
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
            {save.isPending ? 'Saving…' : 'Save & finish'}
          </Button>
        </div>
      </form>
    </QueryState>
  );
}
