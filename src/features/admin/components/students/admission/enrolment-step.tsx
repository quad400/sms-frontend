'use client';

import { Controller, useForm } from 'react-hook-form';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCreateEnrolment } from '../../../hooks/use-students';
import { useClasses, useSessions } from '../../../hooks/use-structure';
import { useAdminCampus } from '../../../lib/campus';
import { Field, FormSection } from './form-bits';

type Values = {
  sessionId: string;
  classId: string;
  enrolledAt: string;
};

export function EnrolmentStep({
  studentId,
  campusId,
  onContinue,
  onSkip,
}: {
  studentId: number;
  campusId?: number | null;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { campusQuery } = useAdminCampus();
  const campusKey =
    campusId != null ? String(campusId) : campusQuery ?? undefined;
  const sessions = useSessions(campusQuery);
  const classes = useClasses({ campusId: campusKey, key: campusKey });
  const create = useCreateEnrolment(studentId);

  const form = useForm<Values>({
    defaultValues: {
      sessionId: '',
      classId: '',
      enrolledAt: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = (values: Values) => {
    create.mutate(
      {
        sessionId: Number(values.sessionId),
        classId: Number(values.classId),
        enrolledAt: values.enrolledAt || undefined,
      },
      {
        onSuccess: () => {
          toastSuccess('Enrolment recorded');
          onContinue();
        },
        onError: (e) => toastError('Could not enrol student', e.message),
      },
    );
  };

  const activeSessions = (sessions.data ?? []).filter((s) => s.isActive);
  const sessionOptions =
    activeSessions.length > 0 ? activeSessions : (sessions.data ?? []);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormSection title="Class placement" icon={BookOpen}>
        <Field
          label="Academic session"
          required
          error={form.formState.errors.sessionId?.message}
        >
          <Controller
            control={form.control}
            name="sessionId"
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Session">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                      {s.isActive ? ' (active)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Class" required error={form.formState.errors.classId?.message}>
          <Controller
            control={form.control}
            name="classId"
            rules={{ required: 'Required' }}
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {(classes.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Enrolment date">
          <Controller
            control={form.control}
            name="enrolledAt"
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select enrolment date"
                aria-label="Enrolment date"
              />
            )}
          />
        </Field>
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          type="submit"
          disabled={create.isPending}
          className="bg-teal-700 hover:bg-teal-800"
        >
          {create.isPending ? 'Saving…' : 'Save & continue'}
        </Button>
      </div>
    </form>
  );
}
