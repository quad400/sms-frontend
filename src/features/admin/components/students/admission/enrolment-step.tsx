'use client';

import { useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
import {
  useCreateEnrolment,
  useStudentEnrolments,
  useUpdateEnrolment,
} from '../../../hooks/use-students';
import { useClasses, useSessions } from '../../../hooks/use-structure';
import { useAdminCampus } from '../../../lib/campus';
import { QueryState } from '../../../lib/shared';
import { Field, FormSection } from './form-bits';

type Values = {
  sessionId: string;
  classId: string;
  enrolledAt: string;
};

export function EnrolmentStep({
  studentId,
  campusId,
  mode = 'create',
  onContinue,
  onSkip,
}: {
  studentId: number;
  campusId?: number | null;
  mode?: 'create' | 'edit';
  onContinue: () => void;
  onSkip: () => void;
}) {
  const { campusQuery } = useAdminCampus();
  const campusKey =
    campusId != null ? String(campusId) : campusQuery ?? undefined;

  const sessions = useSessions(campusKey);
  const existing = useStudentEnrolments(studentId);
  const create = useCreateEnrolment(studentId);
  const update = useUpdateEnrolment(studentId);
  const prefilledRef = useRef(false);
  const lastSessionRef = useRef<string>('');

  const form = useForm<Values>({
    defaultValues: {
      sessionId: '',
      classId: '',
      enrolledAt: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedSessionId = useWatch({ control: form.control, name: 'sessionId' });

  const enrolments = existing.data ?? [];
  const activeEnrolment =
    enrolments.find((e) => e.status === 'active') ?? enrolments[0] ?? null;
  const hasEnrolment = activeEnrolment != null;

  // Classes must belong to the selected (or enrolled) session.
  const classSessionId =
    selectedSessionId ||
    (activeEnrolment ? String(activeEnrolment.sessionId) : '') ||
    undefined;
  const classes = useClasses({
    campusId: campusKey,
    sessionId: classSessionId,
    key: `${campusKey ?? ''}-${classSessionId ?? ''}`,
  });

  const saving = create.isPending || update.isPending;
  const loading =
    existing.isPending ||
    sessions.isPending ||
    (!!classSessionId && classes.isPending);
  const loadError = existing.error ?? sessions.error ?? classes.error;

  const sessionOptions = sessions.data ?? [];
  const classOptions = (classes.data ?? []).filter((c) =>
    classSessionId ? String(c.sessionId) === classSessionId : true,
  );

  useEffect(() => {
    if (existing.isPending || sessions.isPending) return;
    if (prefilledRef.current) return;

    if (activeEnrolment) {
      const next = {
        sessionId: String(activeEnrolment.sessionId),
        classId: String(activeEnrolment.classId),
        enrolledAt: activeEnrolment.enrolledAt
          ? activeEnrolment.enrolledAt.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      };
      form.reset(next);
      lastSessionRef.current = next.sessionId;
      prefilledRef.current = true;
      return;
    }

    if (!sessionOptions.length) return;
    const preferred =
      sessionOptions.find((s) => s.isActive) ?? sessionOptions[0]!;
    form.reset({
      sessionId: String(preferred.id),
      classId: '',
      enrolledAt: new Date().toISOString().slice(0, 10),
    });
    lastSessionRef.current = String(preferred.id);
    prefilledRef.current = true;
  }, [
    existing.isPending,
    sessions.isPending,
    activeEnrolment,
    sessionOptions,
    form,
  ]);

  // When session changes on a new enrolment, drop a stale class selection.
  useEffect(() => {
    if (!selectedSessionId) return;
    if (hasEnrolment) return;
    if (lastSessionRef.current === selectedSessionId) return;
    lastSessionRef.current = selectedSessionId;
    form.setValue('classId', '');
  }, [selectedSessionId, hasEnrolment, form]);

  // Once class list arrives, keep prefilled class only if it exists in options.
  useEffect(() => {
    if (!hasEnrolment || !activeEnrolment || classes.isPending) return;
    const classId = String(activeEnrolment.classId);
    const stillValid = classOptions.some((c) => String(c.id) === classId);
    if (stillValid && form.getValues('classId') !== classId) {
      form.setValue('classId', classId);
    }
  }, [hasEnrolment, activeEnrolment, classes.isPending, classOptions, form]);

  const onSubmit = (values: Values) => {
    const sessionId = Number(values.sessionId);
    const classId = Number(values.classId);
    if (!Number.isFinite(sessionId)) {
      form.setError('sessionId', { message: 'Required' });
      return;
    }
    if (!Number.isFinite(classId)) {
      form.setError('classId', { message: 'Required' });
      return;
    }
    const classRow = classOptions.find((c) => c.id === classId);
    if (!classRow || classRow.sessionId !== sessionId) {
      form.setError('classId', {
        message: 'Choose a class from the selected session',
      });
      return;
    }

    if (activeEnrolment) {
      if (activeEnrolment.classId === classId) {
        onContinue();
        return;
      }
      update.mutate(
        { enrolmentId: activeEnrolment.id, classId },
        {
          onSuccess: () => {
            toastSuccess(mode === 'edit' ? 'Class placement updated' : 'Enrolment updated');
            onContinue();
          },
          onError: (e) => toastError('Could not update enrolment', e.message),
        },
      );
      return;
    }

    create.mutate(
      {
        sessionId,
        classId,
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

  return (
    <QueryState
      isPending={loading}
      error={loadError}
      onRetry={() => {
        void existing.refetch();
        void sessions.refetch();
        void classes.refetch();
      }}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormSection title="Class placement" icon={BookOpen}>
          {hasEnrolment ? (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
              Existing enrolment loaded. You can change class within this session; session
              itself cannot be moved here.
            </p>
          ) : null}
          {!campusKey ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Student campus is required before choosing a session and class.
            </p>
          ) : null}
          {campusKey && sessionOptions.length === 0 ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              No academic sessions for this campus. Create a session under School structure
              first.
            </p>
          ) : null}
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
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={hasEnrolment || sessionOptions.length === 0}
                >
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
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={!classSessionId || classOptions.length === 0}
                >
                  <SelectTrigger aria-label="Class">
                    <SelectValue
                      placeholder={
                        !classSessionId
                          ? 'Select a session first'
                          : classOptions.length === 0
                            ? 'No classes in this session'
                            : 'Select class'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
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
                  disabled={hasEnrolment}
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
            disabled={saving || !campusKey || sessionOptions.length === 0}
            className="bg-teal-700 hover:bg-teal-800"
          >
            {saving ? 'Saving…' : 'Save & continue'}
          </Button>
        </div>
      </form>
    </QueryState>
  );
}
