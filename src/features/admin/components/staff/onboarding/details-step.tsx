'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Briefcase, UserRound } from 'lucide-react';
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
import { useSaveStaff, useStaffMember } from '../../../hooks/use-staff';
import { useCampuses } from '../../../hooks/use-structure';
import { GENDER_CODES, JOB_TITLE_CODES } from '../../../lib/codes';
import { useAdminCampus } from '../../../lib/campus';
import { QueryState } from '../../../lib/shared';
import type { StaffRow } from '../../../types';
import { Field, FormSection } from '../../students/admission/form-bits';

type Values = {
  firstName: string;
  lastName: string;
  genderCode: string;
  jobTitleCode: string;
  campusId: string;
  createUser: boolean;
  username: string;
  password: string;
};

export function DetailsStep({
  staffId,
  onCreated,
}: {
  staffId: number | null;
  onCreated: (staff: StaffRow) => void;
}) {
  const { campusQuery } = useAdminCampus();
  const campuses = useCampuses();
  const existing = useStaffMember(staffId, staffId != null);
  const save = useSaveStaff(staffId ?? undefined);

  const form = useForm<Values>({
    defaultValues: {
      firstName: '',
      lastName: '',
      genderCode: 'male',
      jobTitleCode: 'teacher',
      campusId: campusQuery ?? '',
      createUser: false,
      username: '',
      password: '',
    },
  });
  const createUser = form.watch('createUser');

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
      lastName: s.lastName ?? '',
      genderCode: s.genderCode ?? s.gender ?? 'male',
      jobTitleCode: s.jobTitleCode ?? 'teacher',
      campusId: s.campusId != null ? String(s.campusId) : campusQuery ?? '',
      createUser: false,
      username: '',
      password: '',
    });
  }, [existing.data, form, campusQuery]);

  const onSubmit = (values: Values) => {
    const base = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      genderCode: values.genderCode,
      jobTitleCode: values.jobTitleCode,
      campusId: Number(values.campusId),
      statusCode: 'active',
    };
    const body =
      staffId != null
        ? base
        : values.createUser
          ? {
              ...base,
              createUser: true,
              username: values.username.trim() || undefined,
              password: values.password,
            }
          : base;

    save.mutate(body, {
      onSuccess: (row) => {
        toastSuccess(staffId ? 'Staff updated' : 'Staff created');
        onCreated(row);
      },
      onError: (e) => toastError('Could not save staff', e.message),
    });
  };

  return (
    <QueryState
      isPending={staffId != null && existing.isPending}
      error={staffId != null ? existing.error : null}
      onRetry={() => void existing.refetch()}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormSection title="Personal" icon={UserRound}>
            <Field
              label="First name"
              required
              error={form.formState.errors.firstName?.message}
            >
              <Input
                {...form.register('firstName', { required: 'Required' })}
                autoComplete="given-name"
                placeholder="Enter first name"
              />
            </Field>
            <Field
              label="Last name"
              required
              error={form.formState.errors.lastName?.message}
            >
              <Input
                {...form.register('lastName', { required: 'Required' })}
                autoComplete="family-name"
                placeholder="Enter last name"
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

          <FormSection title="Role & campus" icon={Briefcase}>
            <Field label="Job title" required>
              <Controller
                control={form.control}
                name="jobTitleCode"
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Job title">
                      <SelectValue placeholder="Select job title" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_TITLE_CODES.map((j) => (
                        <SelectItem key={j.code} value={j.code}>
                          {j.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Campus"
              required
              error={form.formState.errors.campusId?.message}
            >
              <Controller
                control={form.control}
                name="campusId"
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
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
            {staffId == null ? (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={createUser}
                    onCheckedChange={(v) => form.setValue('createUser', v === true)}
                  />
                  Create login account
                </label>
                {createUser ? (
                  <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <Field
                      label="Username"
                      error={form.formState.errors.username?.message}
                    >
                      <Input
                        {...form.register('username', {
                          validate: (v) =>
                            !createUser ||
                            !v.trim() ||
                            v.trim().length >= 3 ||
                            'At least 3 characters',
                        })}
                        autoComplete="username"
                        placeholder="Optional — defaults from name"
                      />
                    </Field>
                    <Field
                      label="Temporary password"
                      required
                      error={form.formState.errors.password?.message}
                    >
                      <Input
                        type="password"
                        {...form.register('password', {
                          validate: (v) => {
                            if (!createUser) return true;
                            if (!v || v.length < 8) {
                              return 'Password must be at least 8 characters';
                            }
                            return true;
                          },
                        })}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            ) : null}
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
              : staffId
                ? 'Save & continue'
                : 'Create staff & continue'}
          </Button>
        </div>
      </form>
    </QueryState>
  );
}
