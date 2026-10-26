'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSaveStudent, useStudent } from '../hooks/use-students';
import { useCampuses, useClasses } from '../hooks/use-structure';
import { GENDER_CODES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

type FormValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  genderCode: string;
  campusId: string;
  classId: string;
  phone: string;
  email: string;
};

export function StudentForm({ studentId }: { studentId?: number }) {
  const router = useRouter();
  const { campusQuery } = useAdminCampus();
  const isEdit = studentId != null;

  const existing = useStudent(studentId, isEdit);
  const campuses = useCampuses();
  const classes = useClasses({ campusId: campusQuery, key: campusQuery });

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      genderCode: 'male',
      campusId: campusQuery ?? '',
      classId: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    const s = existing.data;
    if (!s) return;
    form.reset({
      firstName: s.firstName ?? '',
      middleName: s.middleName ?? '',
      lastName: s.lastName ?? '',
      dateOfBirth: '',
      genderCode: s.genderCode ?? s.gender ?? 'male',
      campusId: s.campusId != null ? String(s.campusId) : campusQuery ?? '',
      classId: s.classId != null ? String(s.classId) : '',
      phone: '',
      email: '',
    });
  }, [existing.data, form, campusQuery]);

  const save = useSaveStudent(studentId);

  const onSubmit = (values: FormValues) => {
    save.mutate(
      {
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim() || undefined,
        lastName: values.lastName.trim(),
        dateOfBirth: values.dateOfBirth || undefined,
        genderCode: values.genderCode,
        campusId: Number(values.campusId),
        phone: values.phone || undefined,
        email: values.email || undefined,
      },
      {
        onSuccess: (row) => {
          toastSuccess(isEdit ? 'Student updated' : 'Student created');
          router.push(`/admin/students/${row.id}`);
        },
        onError: (e) => {
          if (e instanceof ApiClientError && /conflict|duplicate/i.test(e.mapped.code + e.message)) {
            toastError('Possible duplicate', e.message);
            return;
          }
          toastError('Could not save', e.message);
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={isEdit ? 'Edit student' : 'Add student'}
        description={isEdit ? `Student #${existing.data?.studentNumber ?? '…'}` : 'Create a student record. Number is assigned on save.'}
      />
      <QueryState
        isPending={isEdit && existing.isPending}
        error={isEdit ? existing.error : null}
        onRetry={() => void existing.refetch()}
      >
        <form
          className="grid gap-6 md:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <section className="space-y-3 rounded-xl border border-border bg-card p-4 md:col-span-1">
            <h2 className="font-heading text-base font-semibold">Personal</h2>
            <Field label="First name" error={form.formState.errors.firstName?.message}>
              <Input {...form.register('firstName', { required: 'Required' })} />
            </Field>
            <Field label="Middle name">
              <Input {...form.register('middleName')} />
            </Field>
            <Field label="Last name" error={form.formState.errors.lastName?.message}>
              <Input {...form.register('lastName', { required: 'Required' })} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" {...form.register('dateOfBirth')} />
            </Field>
            <Field label="Gender">
              <select className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm" {...form.register('genderCode')}>
                {GENDER_CODES.map((g) => (
                  <option key={g.code} value={g.code}>{g.label}</option>
                ))}
              </select>
            </Field>
          </section>
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-base font-semibold">Contact & enrolment</h2>
            <Field label="Campus" error={form.formState.errors.campusId?.message}>
              <select className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm" {...form.register('campusId', { required: 'Required' })}>
                <option value="">Select…</option>
                {(campuses.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Class (optional)">
              <select className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm" {...form.register('classId')}>
                <option value="">None</option>
                {(classes.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <Input {...form.register('phone')} />
            </Field>
            <Field label="Email">
              <Input type="email" {...form.register('email')} />
            </Field>
            <PermissionGate permission="students.medical.update">
              <p className="text-xs text-muted-foreground">Medical details are edited on the student profile Medical tab.</p>
            </PermissionGate>
          </section>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create student'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </QueryState>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
