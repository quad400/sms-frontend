'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { EntityHeader } from '@/components/patterns/entity-header';
import { FilterBar } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useGuardian,
  useGuardians,
  useResetGuardianPassword,
  useUpdateGuardian,
} from '../hooks/use-guardians';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { fullName, type GuardianRow } from '../types';

export function GuardiansList() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const guardians = useGuardians({ page, q: q || undefined });

  const columns: DataTableColumn<GuardianRow>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (r) => (
        <Link className="font-medium text-primary hover:underline" href={`/admin/guardians/${r.id}`}>
          {fullName(r.firstName, r.lastName)}
        </Link>
      ),
    },
    { id: 'phone', header: 'Phone', cell: (r) => r.phone ?? '—' },
    { id: 'email', header: 'Email', cell: (r) => r.email ?? '—' },
    {
      id: 'children',
      header: 'Children',
      cell: (r) =>
        r.children?.length
          ? r.children.map((c) => c.name || c.studentNumber || c.studentId).join(', ')
          : '—',
    },
    {
      id: 'portal',
      header: 'Portal',
      cell: (r) => (r.userId ? 'Linked' : 'No account'),
    },
  ];

  const total = guardians.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (guardians.data?.meta.pageSize ?? 10)));

  return (
    <div className="space-y-5">
      <PageHeader title="Guardians" description={`${total} guardian${total === 1 ? '' : 's'}`} />
      <FilterBar search={q} onSearchChange={(v) => { setQ(v); setPage(1); }} searchPlaceholder="Name or phone…" />
      <QueryState isPending={guardians.isPending} error={guardians.error} onRetry={() => void guardians.refetch()}>
        <DataTable columns={columns} rows={guardians.data?.data ?? []} density={density} />
        {pages > 1 ? (
          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page}/{pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}

export function GuardianDetail({ guardianId }: { guardianId: number }) {
  const guardian = useGuardian(guardianId);
  const form = useForm({
    values: {
      firstName: guardian.data?.firstName ?? '',
      lastName: guardian.data?.lastName ?? '',
      phone: guardian.data?.phone ?? '',
      email: guardian.data?.email ?? '',
    },
  });

  const save = useUpdateGuardian(guardianId);
  const reset = useResetGuardianPassword();

  const g = guardian.data;

  return (
    <div className="space-y-5">
      <QueryState isPending={guardian.isPending} error={guardian.error} onRetry={() => void guardian.refetch()}>
        {g ? (
          <>
            <EntityHeader
              title={fullName(g.firstName, g.lastName)}
              subtitle={g.phone ?? undefined}
              actions={
                <PermissionGate permission="users.user.reset-password">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!g.userId || reset.isPending}
                    onClick={() =>
                      reset.mutate(g.userId!, {
                        onSuccess: () => toastSuccess('Reset link sent'),
                        onError: (e) => toastError('Could not reset', e.message),
                      })
                    }
                  >
                    Send reset link
                  </Button>
                </PermissionGate>
              }
            />
            <form
              className="grid max-w-lg gap-3 rounded-xl border border-border bg-card p-4"
              onSubmit={form.handleSubmit((v) =>
                save.mutate(v, {
                  onSuccess: () => toastSuccess('Guardian updated'),
                  onError: (e) => toastError('Could not save', e.message),
                }),
              )}
            >
              <h2 className="font-heading text-base font-semibold">Contact</h2>
              <div className="grid gap-1.5">
                <Label>First name</Label>
                <Input {...form.register('firstName')} />
              </div>
              <div className="grid gap-1.5">
                <Label>Last name</Label>
                <Input {...form.register('lastName')} />
              </div>
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input {...form.register('phone')} />
              </div>
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input type="email" {...form.register('email')} />
              </div>
              <PermissionGate permission="students.guardian.update">
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? 'Saving…' : 'Save'}
                </Button>
              </PermissionGate>
            </form>
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-2 font-heading text-base font-semibold">Linked children</h2>
              {g.children?.length ? (
                <ul className="space-y-1 text-sm">
                  {g.children.map((c) => (
                    <li key={c.studentId}>
                      <Link className="text-primary hover:underline" href={`/admin/students/${c.studentId}`}>
                        {c.name || c.studentNumber || `Student ${c.studentId}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No linked children.</p>
              )}
            </section>
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
