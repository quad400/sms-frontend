'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterBar } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Application, EntranceTest, Intake } from '../api/admissions';
import {
  useAdmissionForm,
  useApplication,
  useApplications,
  useAssignTestCandidates,
  useCreateEntranceTest,
  useCreateIntake,
  useEntranceTests,
  useIntakes,
  useIssueOffer,
  useMakeDecision,
  useWithdrawOffer,
} from '../hooks/use-admissions';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

export function IntakesPage() {
  const { density } = useAdminCampus();
  const [name, setName] = useState('');
  const list = useIntakes();
  const create = useCreateIntake();
  const addIntake = () =>
    create.mutate(
      { name },
      {
        onSuccess: () => {
          toastSuccess('Intake created');
          setName('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<Intake>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status ?? 'open'} /> },
    { id: 'window', header: 'Window', cell: (r) => `${r.opensAt ?? '—'} → ${r.closesAt ?? '—'}` },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Intakes"
        actions={
          <PermissionGate permission="admissions.intake.create">
            <div className="flex gap-2">
              <Input className="max-w-xs" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Button type="button" disabled={!name || create.isPending} onClick={addIntake}>
                Add
              </Button>
            </div>
          </PermissionGate>
        }
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function ApplicationsPage() {
  const { density } = useAdminCampus();
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'table' | 'board'>('table');
  const [q, setQ] = useState('');
  const list = useApplications({ status: status || undefined });
  const rows = (list.data?.data ?? []).filter((a) => {
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return (a.applicantName ?? '').toLowerCase().includes(needle) || String(a.id).includes(needle);
  });
  const columns: DataTableColumn<Application>[] = [
    {
      id: 'name',
      header: 'Applicant',
      cell: (r) => (
        <Link className="text-primary hover:underline" href={`/admin/admissions/applications/${r.id}`}>
          {r.applicantName ?? `Application ${r.id}`}
        </Link>
      ),
    },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'decision', header: 'Decision', cell: (r) => r.decision ?? '—' },
    { id: 'offer', header: 'Offer', cell: (r) => r.offerStatus ?? '—' },
  ];
  const boardColumns = ['submitted', 'under-review', 'admitted', 'waitlist', 'rejected', 'offered'];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Applications"
        actions={
          <SegmentedControl
            aria-label="Applications view"
            value={view}
            onValueChange={setView}
            options={[
              { value: 'table', label: 'Table' },
              { value: 'board', label: 'Board' },
            ]}
          />
        }
      />
      <FilterBar search={q} onSearchChange={setQ}>
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {boardColumns.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FilterBar>
      <QueryState isPending={list.isPending} error={list.error}>
        {view === 'table' ? (
          <DataTable columns={columns} rows={rows} density={density} />
        ) : (
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {boardColumns.map((col) => (
              <div key={col} className="rounded-xl border border-border bg-muted/20 p-2">
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{col}</h3>
                <ul className="space-y-2">
                  {rows
                    .filter((a) => a.status === col || a.decision === col || a.offerStatus === col)
                    .map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/admin/admissions/applications/${a.id}`}
                          className="block rounded-lg border border-border bg-card px-2 py-2 text-sm hover:border-primary/40"
                        >
                          {a.applicantName ?? a.id}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

export function ApplicationDetailPage({ applicationId }: { applicationId: number }) {
  const app = useApplication(applicationId);
  const decideMutation = useMakeDecision(applicationId);
  const offerMutation = useIssueOffer(applicationId);
  const withdrawMutation = useWithdrawOffer(applicationId);
  const onError = (e: Error) => toastError('Failed', e.message);
  const decide = (decision: string) =>
    decideMutation.mutate(decision, { onSuccess: () => toastSuccess('Decision recorded'), onError });
  const offer = () =>
    offerMutation.mutate(undefined, {
      onSuccess: () => toastSuccess('Offer issued — enrolment appears only after acceptance payment'),
      onError,
    });
  const withdraw = () =>
    withdrawMutation.mutate('Withdrawn by admin', {
      onSuccess: () => toastSuccess('Offer withdrawn'),
      onError,
    });
  const a = app.data;
  return (
    <div className="space-y-5">
      <QueryState isPending={app.isPending} error={app.error}>
        {a ? (
          <>
            <PageHeader
              title={a.applicantName ?? `Application #${a.id}`}
              description={`${a.email ?? ''} ${a.phone ?? ''}`}
              actions={<StatusBadge status={a.status} />}
            />
            <p className="text-sm text-muted-foreground">
              Decision: {a.decision ?? '—'} · Offer: {a.offerStatus ?? 'none'}. Enrolment is not marked complete until the acceptance invoice is paid.
            </p>
            <div className="flex flex-wrap gap-2">
              <PermissionGate permission="admissions.decision.make">
                <Button type="button" variant="outline" onClick={() => decide('admit')}>Admit</Button>
                <Button type="button" variant="outline" onClick={() => decide('waitlist')}>Waitlist</Button>
                <Button type="button" variant="outline" onClick={() => decide('reject')}>Reject</Button>
              </PermissionGate>
              <PermissionGate permission="admissions.offer.issue">
                <Button type="button" onClick={offer}>Issue offer</Button>
              </PermissionGate>
              <PermissionGate permission="admissions.offer.withdraw">
                <Button type="button" variant="outline" onClick={withdraw}>Withdraw offer</Button>
              </PermissionGate>
            </div>
          </>
        ) : null}
      </QueryState>
    </div>
  );
}

export function EntranceTestsPage() {
  const { density } = useAdminCampus();
  const [name, setName] = useState('');
  const list = useEntranceTests();
  const create = useCreateEntranceTest();
  const assign = useAssignTestCandidates();
  const addTest = () =>
    create.mutate(
      { name },
      {
        onSuccess: () => {
          toastSuccess('Test created');
          setName('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<EntranceTest>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name },
    { id: 'when', header: 'Scheduled', cell: (r) => r.scheduledAt ?? '—' },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status ?? 'draft'} /> },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            assign.mutate(
              { id: r.id, applicationIds: [] },
              {
                onSuccess: () => toastSuccess('Candidates updated'),
                onError: (e) => toastError('Failed', e.message),
              },
            )
          }
        >
          Assign
        </Button>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Entrance tests"
        actions={
          <div className="flex gap-2">
            <Input className="max-w-xs" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <Button type="button" disabled={!name || create.isPending} onClick={addTest}>
              Add
            </Button>
          </div>
        }
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function OffersPage() {
  const list = useApplications({ status: 'offered' });
  return (
    <div className="space-y-5">
      <PageHeader
        title="Offers"
        description="Offers are issued from application detail. This list shows applications with offer activity."
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <ul className="space-y-2">
          {(list.data?.data ?? []).map((a) => (
            <li key={a.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <Link className="text-primary hover:underline" href={`/admin/admissions/applications/${a.id}`}>
                {a.applicantName ?? a.id}
              </Link>
              <StatusBadge status={a.offerStatus ?? a.status} />
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function AdmissionFormSettingsPage() {
  const form = useAdmissionForm();
  return (
    <div className="space-y-5">
      <PageHeader
        title="Admission form"
        description="Public form preview. Staff edit capacity and fields via intakes / backend config."
        actions={
          <Button asChild variant="outline">
            <a href="/apply" target="_blank" rel="noreferrer">
              Open /apply
            </a>
          </Button>
        }
      />
      <QueryState isPending={form.isPending} error={form.error}>
        <pre className="overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs">
          {JSON.stringify(form.data ?? {}, null, 2)}
        </pre>
      </QueryState>
    </div>
  );
}
