'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Home, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiClientError } from '@/lib/api/errors';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSaveStudent, useStudent } from '../../../hooks/use-students';
import { useCampuses, useHouses } from '../../../hooks/use-structure';
import { GENDER_CODES } from '../../../lib/codes';
import { useAdminCampus } from '../../../lib/campus';
import { QueryState } from '../../../lib/shared';
import type { StudentRow } from '../../../types';
import { Field, FormSection } from './form-bits';

type Values = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  genderCode: string;
  campusId: string;
  houseId: string;
};

export function DetailsStep({
  studentId,
  onCreated,
}: {
  studentId: number | null;
  onCreated: (student: StudentRow) => void;
}) {
  const { campusQuery } = useAdminCampus();
  const campuses = useCampuses();
  const existing = useStudent(studentId, studentId != null);
  const save = useSaveStudent(studentId ?? undefined);

  const form = useForm<Values>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      genderCode: 'male',
      campusId: campusQuery ?? '',
      houseId: '',
    },
  });

  const campusId = form.watch('campusId') || campusQuery;
  const houses = useHouses(campusId || undefined);

  useEffect(() => {
    if (!form.getValues('campusId') && campusQuery) {
      form.setValue('campusId', campusQuery);
    }
  }, [campusQuery, form]);

  useEffect(() => {
    const s = existing.data;
    if (!s) return;
    form.reset({
      firstName: s.firstName ?? '',
      middleName: s.middleName ?? '',
      lastName: s.lastName ?? '',
      dateOfBirth: s.dateOfBirth?.slice(0, 10) ?? '',
      genderCode: s.genderCode ?? s.gender ?? 'male',
      campusId: s.campusId != null ? String(s.campusId) : campusQuery ?? '',
      houseId: s.houseId != null ? String(s.houseId) : '',
    });
  }, [existing.data, form, campusQuery]);

  const onSubmit = (values: Values) => {
    if (!values.dateOfBirth) {
      form.setError('dateOfBirth', { message: 'Required' });
      return;
    }
    const base = {
      firstName: values.firstName.trim(),
      middleName: values.middleName.trim() || undefined,
      lastName: values.lastName.trim(),
      dateOfBirth: values.dateOfBirth,
      genderCode: values.genderCode,
      houseId: values.houseId ? Number(values.houseId) : undefined,
    };
    const body =
      studentId != null
        ? base
        : {
            ...base,
            campusId: Number(values.campusId),
            statusCode: 'active',
          };
    save.mutate(body, {
      onSuccess: (row) => {
        toastSuccess(studentId ? 'Student updated' : 'Student created');
        onCreated(row);
      },
      onError: (e) => {
        if (
          e instanceof ApiClientError &&
          /conflict|duplicate/i.test(e.mapped.code + e.message)
        ) {
          toastError('Possible duplicate', e.message);
          return;
        }
        toastError('Could not save student', e.message);
      },
    });
  };

  const houseOptions = houses.data ?? [];

  return (
    <QueryState
      isPending={studentId != null && existing.isPending}
      error={studentId != null ? existing.error : null}
      onRetry={() => void existing.refetch()}
    >
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormSection title="Personal" icon={UserRound}>
          <Field label="First name" required error={form.formState.errors.firstName?.message}>
            <Input
              {...form.register('firstName', { required: 'Required' })}
              autoComplete="given-name"
              placeholder="Enter first name"
            />
          </Field>
          <Field label="Middle name">
            <Input
              placeholder="Enter middle name"
              {...form.register('middleName')}
              autoComplete="additional-name"
            />
          </Field>
          <Field label="Last name" required error={form.formState.errors.lastName?.message}>
            <Input
              {...form.register('lastName', { required: 'Required' })}
              autoComplete="family-name"
              placeholder="Enter last name"
            />
          </Field>
          <Field label="Date of birth" required error={form.formState.errors.dateOfBirth?.message}>
            <Controller
              control={form.control}
              name="dateOfBirth"
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select date of birth"
                  aria-label="Date of birth"
                  toYear={new Date().getFullYear()}
                />
              )}
            />
          </Field>
          <Field label="Gender" required>
            <Controller
              control={form.control}
              name="genderCode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_CODES.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </FormSection>

        <FormSection title="Placement" icon={Home}>
          <Field
            label="Campus"
            required
            error={form.formState.errors.campusId?.message}
            hint={studentId != null ? 'Campus is set on create and cannot be changed here.' : undefined}
          >
            <Controller
              control={form.control}
              name="campusId"
              rules={{ required: 'Required' }}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={studentId != null}
                >
                  <SelectTrigger aria-label="Campus">
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {(campuses.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="House (optional)" hint="Can be assigned later from the profile.">
            <Controller
              control={form.control}
              name="houseId"
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                >
                  <SelectTrigger aria-label="House">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {houseOptions.map((h) => (
                      <SelectItem key={h.id} value={String(h.id)}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            Class placement happens in the Enrolment step after the student record is created.
          </p>
        </FormSection>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={save.isPending}
          className="bg-teal-700 hover:bg-teal-800"
        >
          {save.isPending
            ? 'Saving…'
            : studentId
              ? 'Save & continue'
              : 'Create student & continue'}
        </Button>
      </div>
    </form>
    </QueryState>
  );
}
