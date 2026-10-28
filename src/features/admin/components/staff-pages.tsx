'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { ArrowLeft, Briefcase, Phone, UserRound } from 'lucide-react';
import { EntityHeader } from '@/components/patterns/entity-header';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
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
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useLeaveRequests } from '../hooks/use-leave';
import {
  useSaveStaff,
  useStaffAllocations,
  useStaffMember,
} from '../hooks/use-staff';
import { useCampuses } from '../hooks/use-structure';
import { GENDER_CODES, JOB_TITLE_CODES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { fullName } from '../types';
import { Field, FormSection } from './students/admission/form-bits';

export { StaffList } from './staff';

export function StaffForm({ staffId }: { staffId?: number }) {
  const router = useRouter();
  const { campusQuery } = useAdminCampus();
  const isEdit = staffId != null;
  const existing = useStaffMember(staffId, isEdit);
  const campuses = useCampuses();
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      genderCode: 'male',
      jobTitleCode: 'teacher',
      campusId: campusQuery ?? '',
      phone: '',
      email: '',
      hireDate: '',
    },
  });

  useEffect(() => {
    const s = existing.data;
    if (!s) return;
    form.reset({
      firstName: s.firstName,
      lastName: s.lastName,
      genderCode: s.genderCode ?? 'male',
      jobTitleCode: s.jobTitleCode ?? 'teacher',
      campusId: s.campusId != null ? String(s.campusId) : campusQuery ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      hireDate: s.hireDate?.slice(0, 10) ?? '',
    });
  }, [existing.data, form, campusQuery]);

  const save = useSaveStaff(staffId);

  const onSubmit = (v: {
    firstName: string;
    lastName: string;
    genderCode: string;
    jobTitleCode: string;
    campusId: string;
    phone: string;
    email: string;
    hireDate: string;
  }) => {
    save.mutate(
      {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        genderCode: v.genderCode,
        jobTitleCode: v.jobTitleCode,
        campusId: Number(v.campusId),
        phone: v.phone || undefined,
        email: v.email || undefined,
        hireDate: v.hireDate || undefined,
      },
      {
        onSuccess: (row) => {
          toastSuccess(isEdit ? 'Staff updated' : 'Staff created');
          router.push(`/admin/staff/${row.id}`);
        },
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  };

  return (
    <div className="mx-auto space-y-5">
      <div className="space-y-3">
        <Link
          href={isEdit ? `/admin/staff/${staffId}` : '/admin/staff'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          {isEdit ? 'Back to profile' : 'Back to directory'}
        </Link>
        <PageHeader
          title={isEdit ? 'Edit staff' : 'Onboard staff'}
          description={
            isEdit
              ? 'Update personal details, role, and contact information.'
              : undefined
          }
          titleAddon={
            existing.data?.staffNumber ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
                {existing.data.staffNumber}
              </span>
            ) : null
          }
        />
      </div>

      <QueryState
        isPending={isEdit && existing.isPending}
        error={isEdit ? existing.error : null}
        onRetry={() => void existing.refetch()}
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormSection title="Personal" icon={UserRound}>
              <Field label="First name" required>
                <Input
                  {...form.register('firstName', { required: true })}
                  autoComplete="given-name"
                  placeholder="Enter first name"
                />
              </Field>
              <Field label="Last name" required>
                <Input
                  {...form.register('lastName', { required: true })}
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
                  rules={{ required: true }}
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
              <Field label="Campus" required>
                <Controller
                  control={form.control}
                  name="campusId"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
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
            </FormSection>
          </div>

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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={isEdit ? `/admin/staff/${staffId}` : '/admin/staff'}>
                Cancel
              </Link>
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

export function StaffProfile({ staffId, tab = 'overview' }: { staffId: number; tab?: string }) {
  const member = useStaffMember(staffId);
  const allocations = useStaffAllocations(staffId, tab === 'allocations');
  const leave = useLeaveRequests({ staffId: String(staffId) }, tab === 'leave');

  const s = member.data;
  const tabs = [
    { id: 'overview', href: `/admin/staff/${staffId}`, label: 'Overview' },
    { id: 'allocations', href: `/admin/staff/${staffId}/allocations`, label: 'Allocations' },
    { id: 'leave', href: `/admin/staff/${staffId}/leave`, label: 'Leave' },
    { id: 'account', href: `/admin/staff/${staffId}/account`, label: 'Account' },
  ];

  return (
    <div className="space-y-5">
      <QueryState
        isPending={member.isPending}
        error={member.error}
        onRetry={() => void member.refetch()}
      >
        {s ? (
          <>
            <EntityHeader
              title={fullName(s.firstName, s.lastName, s.middleName)}
              subtitle={s.staffNumber}
              status={s.statusCode ?? s.status}
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/staff/${staffId}/edit`}>Edit</Link>
                </Button>
              }
            />
            <nav className="flex flex-wrap gap-1 border-b border-border pb-2">
              {tabs.map((t) => (
                <Link
                  key={t.id}
                  href={t.href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                    tab === t.id
                      ? 'bg-teal-700 text-white'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
            {tab === 'overview' ? (
              <dl className="max-w-lg rounded-xl border border-border bg-card p-4 text-sm shadow-[var(--shadow-card)]">
                <Row label="Job" value={s.jobTitle ?? s.jobTitleCode} />
                <Row label="Email" value={s.email} />
                <Row label="Phone" value={s.phone} />
                <Row label="Hire date" value={s.hireDate} />
              </dl>
            ) : null}
            {tab === 'allocations' ? (
              <QueryState
                isPending={allocations.isPending}
                error={allocations.error}
                onRetry={() => void allocations.refetch()}
              >
                <pre className="overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs">
                  {JSON.stringify(allocations.data ?? [], null, 2)}
                </pre>
              </QueryState>
            ) : null}
            {tab === 'leave' ? (
              <QueryState
                isPending={leave.isPending}
                error={leave.error}
                onRetry={() => void leave.refetch()}
              >
                <ul className="space-y-2">
                  {(leave.data?.data ?? []).map((r) => (
                    <li
                      key={r.id}
                      className="rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {r.startDate} → {r.endDate} · <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              </QueryState>
            ) : null}
            {tab === 'account' ? (
              <p className="text-sm text-muted-foreground">
                Roles and campus access are managed under Access → Users
                {s.userId ? (
                  <>
                    {' '}
                    (
                    <Link className="text-primary hover:underline" href="/admin/access/users">
                      open users
                    </Link>
                    ).
                  </>
                ) : (
                  '. No login linked.'
                )}
              </p>
            ) : null}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}
