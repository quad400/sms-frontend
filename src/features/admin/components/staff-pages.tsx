'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { EntityHeader } from '@/components/patterns/entity-header';
import { FilterBar, FilterSelect } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useLeaveRequests } from '../hooks/use-leave';
import {
  useArchiveStaff,
  useSaveStaff,
  useStaffAllocations,
  useStaffList,
  useStaffMember,
} from '../hooks/use-staff';
import { useCampuses } from '../hooks/use-structure';
import { GENDER_CODES, STAFF_STATUS_CODES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { fullName, type StaffRow } from '../types';
import { ImportWizard } from './import-wizard';

export function StaffList() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const staff = useStaffList({
    page,
    q: q || undefined,
    campusId: campusQuery,
    status: status || undefined,
  });
  const archive = useArchiveStaff();

  const columns: DataTableColumn<StaffRow>[] = [
    {
      id: 'number',
      header: 'Number',
      cell: (r) => <span className="font-mono text-xs">{r.staffNumber ?? '—'}</span>,
    },
    {
      id: 'name',
      header: 'Name',
      cell: (r) => (
        <Link className="font-medium text-primary hover:underline" href={`/admin/staff/${r.id}`}>
          {fullName(r.firstName, r.lastName, r.middleName)}
        </Link>
      ),
    },
    { id: 'job', header: 'Job', cell: (r) => r.jobTitle ?? r.jobTitleCode ?? '—' },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r.statusCode ?? r.status ?? 'active'} />,
    },
    {
      id: 'account',
      header: 'Account',
      cell: (r) => (r.userId ? 'Linked' : 'None'),
    },
    {
      id: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/staff/${r.id}/edit`}>Edit</Link>
          </Button>
          <PermissionGate permission="staff.staff.archive">
            <Button variant="ghost" size="sm" onClick={() => setArchiveId(r.id)}>
              Archive
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  const total = staff.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (staff.data?.meta.pageSize ?? 10)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff"
        description={`${total} staff`}
        actions={
          <div className="flex gap-2">
            <PermissionGate permission="staff.staff.create">
              <Button asChild>
                <Link href="/admin/staff/new">Add staff</Link>
              </Button>
            </PermissionGate>
            <PermissionGate permission="import-export.import.create">
              <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <FilterBar search={q} onSearchChange={(v) => { setQ(v); setPage(1); }}>
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={STAFF_STATUS_CODES.map((s) => ({ value: s.code, label: s.label }))}
        />
      </FilterBar>
      <QueryState isPending={staff.isPending} error={staff.error} onRetry={() => void staff.refetch()}>
        <DataTable columns={columns} rows={staff.data?.data ?? []} density={density} />
        {pages > 1 ? (
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page}/{pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        ) : null}
      </QueryState>
      <ConfirmDialog
        open={archiveId !== null}
        onOpenChange={(o) => !o && setArchiveId(null)}
        title="Archive staff member?"
        confirmLabel="Archive"
        destructive
        isPending={archive.isPending}
        onConfirm={() =>
          archiveId &&
          archive.mutate(archiveId, {
            onSuccess: () => {
              toastSuccess('Staff archived');
              setArchiveId(null);
            },
            onError: (e) => toastError('Could not archive', e.message),
          })
        }
      />
      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultEntity="staff"
        allowedEntities={['staff']}
      />
    </div>
  );
}

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
      createUser: false,
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
      hireDate: s.hireDate ?? '',
      createUser: false,
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
    createUser: boolean;
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
        createUser: !isEdit ? v.createUser : undefined,
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
    <div className="space-y-5">
      <PageHeader title={isEdit ? 'Edit staff' : 'Add staff'} />
      <QueryState isPending={isEdit && existing.isPending} error={isEdit ? existing.error : null} onRetry={() => void existing.refetch()}>
        <form className="grid max-w-xl gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label>First name</Label>
            <Input {...form.register('firstName', { required: true })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Last name</Label>
            <Input {...form.register('lastName', { required: true })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Gender</Label>
            <select className="h-10 rounded-md border border-border bg-background px-2 text-sm" {...form.register('genderCode')}>
              {GENDER_CODES.map((g) => (
                <option key={g.code} value={g.code}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Job title code</Label>
            <Input {...form.register('jobTitleCode', { required: true })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Campus</Label>
            <select className="h-10 rounded-md border border-border bg-background px-2 text-sm" {...form.register('campusId', { required: true })}>
              <option value="">Select…</option>
              {(campuses.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label>Phone</Label>
            <Input {...form.register('phone')} />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input type="email" {...form.register('email')} />
          </div>
          <div className="grid gap-1.5">
            <Label>Hire date</Label>
            <Input type="date" {...form.register('hireDate')} />
          </div>
          {!isEdit ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register('createUser')} />
              Create login account
            </label>
          ) : null}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
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
      <QueryState isPending={member.isPending} error={member.error} onRetry={() => void member.refetch()}>
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
                    'rounded-md px-3 py-1.5 text-sm',
                    tab === t.id ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/60',
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
            {tab === 'overview' ? (
              <dl className="max-w-lg rounded-xl border border-border bg-card p-4 text-sm">
                <Row label="Job" value={s.jobTitle ?? s.jobTitleCode} />
                <Row label="Email" value={s.email} />
                <Row label="Phone" value={s.phone} />
                <Row label="Hire date" value={s.hireDate} />
              </dl>
            ) : null}
            {tab === 'allocations' ? (
              <QueryState isPending={allocations.isPending} error={allocations.error} onRetry={() => void allocations.refetch()}>
                <pre className="overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs">
                  {JSON.stringify(allocations.data ?? [], null, 2)}
                </pre>
              </QueryState>
            ) : null}
            {tab === 'leave' ? (
              <QueryState isPending={leave.isPending} error={leave.error} onRetry={() => void leave.refetch()}>
                <ul className="space-y-2">
                  {(leave.data?.data ?? []).map((r) => (
                    <li key={r.id} className="rounded-lg border border-border px-3 py-2 text-sm">
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
                    (<Link className="text-primary hover:underline" href="/admin/access/users">open users</Link>
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
