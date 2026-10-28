'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Home, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useSaveStudent, useStudent } from '../hooks/use-students';
import { useHouses } from '../hooks/use-structure';
import { GENDER_CODES, STUDENT_STATUS_CODES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

type FormValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  genderCode: string;
  houseId: string;
  statusCode: string;
};

/** Edit-only student form. New admissions use `AdmissionWizard`. */
export function StudentForm({ studentId }: { studentId: number }) {
  const router = useRouter();
  const { campusQuery } = useAdminCampus();

  const existing = useStudent(studentId);
  const houses = useHouses(
    existing.data?.campusId != null
      ? String(existing.data.campusId)
      : campusQuery,
  );

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      genderCode: 'male',
      houseId: '',
      statusCode: 'active',
    },
  });

  useEffect(() => {
    const s = existing.data;
    if (!s) return;
    form.reset({
      firstName: s.firstName ?? '',
      middleName: s.middleName ?? '',
      lastName: s.lastName ?? '',
      dateOfBirth: s.dateOfBirth?.slice(0, 10) ?? '',
      genderCode: s.genderCode ?? s.gender ?? 'male',
      houseId: s.houseId != null ? String(s.houseId) : '',
      statusCode: s.statusCode ?? s.status ?? 'active',
    });
  }, [existing.data, form]);

  const save = useSaveStudent(studentId);

  const onSubmit = (values: FormValues) => {
    save.mutate(
      {
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim() || undefined,
        lastName: values.lastName.trim(),
        dateOfBirth: values.dateOfBirth || undefined,
        genderCode: values.genderCode,
        houseId: values.houseId ? Number(values.houseId) : null,
        statusCode: values.statusCode || undefined,
      },
      {
        onSuccess: (row) => {
          toastSuccess('Student updated');
          router.push(`/admin/students/${row.id}`);
        },
        onError: (e) => {
          if (
            e instanceof ApiClientError &&
            /conflict|duplicate/i.test(e.mapped.code + e.message)
          ) {
            toastError('Possible duplicate', e.message);
            return;
          }
          toastError('Could not save', e.message);
        },
      },
    );
  };

  return (
    <div className="mx-auto space-y-5">
      <div className="space-y-3">
        <Link
          href={`/admin/students/${studentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to profile
        </Link>
        <PageHeader
          title="Edit student"
          description={`Update details for ${existing.data?.studentNumber ?? 'this student'}.`}
          titleAddon={
            existing.data?.studentNumber ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
                {existing.data.studentNumber}
              </span>
            ) : null
          }
        />
      </div>

      <QueryState
        isPending={existing.isPending}
        error={existing.error}
        onRetry={() => void existing.refetch()}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormSection title="Personal" icon={UserRound}>
              <Field label="First name" required error={form.formState.errors.firstName?.message}>
                <Input
                  {...form.register('firstName', { required: 'Required' })}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Middle name">
                <Input {...form.register('middleName')} autoComplete="additional-name" />
              </Field>
              <Field label="Last name" required error={form.formState.errors.lastName?.message}>
                <Input
                  {...form.register('lastName', { required: 'Required' })}
                  autoComplete="family-name"
                />
              </Field>
              <Field label="Date of birth">
                <Controller
                  control={form.control}
                  name="dateOfBirth"
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

            <FormSection title="Status & house" icon={Home}>
              <Field label="Status">
                <Controller
                  control={form.control}
                  name="statusCode"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-label="Status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_STATUS_CODES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="House (optional)">
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
                        {(houses.data ?? []).map((h) => (
                          <SelectItem key={h.id} value={String(h.id)}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <PermissionGate permission="students.medical.update">
                <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  Medical details are edited on the student profile Medical tab. Class changes use
                  Enrolment.
                </p>
              </PermissionGate>
            </FormSection>
          </div>

          <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-2 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-[var(--shadow-card)] backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={save.isPending}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </QueryState>
    </div>
  );
}

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="size-3.5" />
        </span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
