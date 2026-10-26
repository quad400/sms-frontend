'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterBar } from '@/components/patterns/filter-bar';
import { MoneyInput, MoneyText } from '@/components/patterns/money';
import { PageHeader } from '@/components/patterns/page-header';
import { SignedFileLink } from '@/components/patterns/signed-file-link';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { asRecord, str } from '@/lib/utils/record';
import { getFeeClearance, getPaymentReceipt } from '../api/fees';
import type { DebtorRow, Invoice, Payment, ReconciliationException } from '../api/fees';
import {
  useAwardScholarship,
  useBatchInvoices,
  useCancelInvoice,
  useCreateAdjustment,
  useCreateCheckoutSession,
  useCreateCreditNote,
  useCreateDiscount,
  useCreateFeeStructure,
  useCreateInvoice,
  useCreateScholarship,
  useDebtors,
  useDiscounts,
  useDismissException,
  useFeeItems,
  useFeeStructure,
  useFeeStructures,
  useImportBankStatement,
  useInvoice,
  useInvoices,
  useIssueInvoice,
  useMatchException,
  usePayments,
  useReconciliationExceptions,
  useRecordPayment,
  useResendReceipt,
  useSaveSettingsGroup,
  useScholarships,
  useSendDebtorReminders,
  useSettingsGroup,
  useStudentAccount,
  useUpdateFeeStructure,
} from '../hooks/use-fees';
import { ImportWizard } from './import-wizard';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

function newIdempotencyKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `pay-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FeeStructuresPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const list = useFeeStructures({ page, campusId: campusQuery });
  const detail = useFeeStructure(selectedId);
  const items = useFeeItems();

  const create = useCreateFeeStructure();
  function createStructure() {
    create.mutate(
      {
        name: `Structure ${Date.now()}`,
        campusId: campusQuery ? Number(campusQuery) : undefined,
        items: [],
      },
      {
        onSuccess: (row) => {
          toastSuccess('Structure created');
          setSelectedId(row.id);
        },
        onError: (e) => toastError('Could not create', e.message),
      },
    );
  }

  const save = useUpdateFeeStructure();
  function saveStructure(body: Record<string, unknown>) {
    save.mutate(
      { id: selectedId!, body },
      {
        onSuccess: () => toastSuccess('Saved'),
        onError: (e) => {
          toastError('Could not save — create a new version if invoices exist', e.message);
        },
      },
    );
  }

  const columns: DataTableColumn<{
    id: number;
    name: string;
    version?: number;
    totalMinor?: number;
    currency?: string;
    isCurrent?: boolean;
  }>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (r) => (
        <button type="button" className="text-left font-medium text-primary hover:underline" onClick={() => setSelectedId(r.id)}>
          {r.name}
        </button>
      ),
    },
    { id: 'version', header: 'Ver', cell: (r) => r.version ?? 1 },
    {
      id: 'total',
      header: 'Total',
      cell: (r) => <MoneyText minor={r.totalMinor} currency={r.currency} />,
    },
    {
      id: 'current',
      header: 'Current',
      cell: (r) => (r.isCurrent ? <StatusBadge status="active" /> : '—'),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fee structures"
        actions={
          <div className="flex gap-2">
            <PermissionGate permission="import-export.import.create">
              <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </PermissionGate>
            <PermissionGate permission="fees.structure.create">
              <Button type="button" onClick={createStructure}>
                New structure
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
      {selectedId && detail.data ? (
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-2 font-heading font-semibold">{detail.data.name}</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Used by {detail.data.invoiceCount ?? 0} invoices
            {(detail.data.invoiceCount ?? 0) > 0 ? ' — edits create a new version via Save as new' : ''}
          </p>
          <ul className="space-y-1 text-sm">
            {(detail.data.items ?? []).map((it, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span>
                  {it.name ?? items.data?.find((f) => f.id === it.feeItemId)?.name ?? it.feeItemId}
                </span>
                <MoneyText minor={it.amountMinor} currency={it.currency} />
              </li>
            ))}
          </ul>
          <PermissionGate permission="fees.structure.update">
            <Button
              className="mt-3"
              type="button"
              variant="outline"
              onClick={() =>
                saveStructure({
                  name: detail.data!.name,
                  items: detail.data!.items ?? [],
                })
              }
            >
              Save
            </Button>
          </PermissionGate>
        </div>
      ) : null}
      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        defaultEntity="fee-structures"
        allowedEntities={['fee-structures', 'opening-balances']}
      />
    </div>
  );
}

export function DiscountsPage() {
  const [tab, setTab] = useState<'discounts' | 'scholarships'>('discounts');
  const discounts = useDiscounts();
  const scholarships = useScholarships();
  const [name, setName] = useState('');
  const [awardOpen, setAwardOpen] = useState<number | null>(null);
  const [studentId, setStudentId] = useState('');

  const createDisc = useCreateDiscount();
  function addDiscount() {
    createDisc.mutate(
      { name, type: 'percentage', value: 10 },
      {
        onSuccess: () => {
          toastSuccess('Discount created');
          setName('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }
  const createSchol = useCreateScholarship();
  function addScholarship() {
    createSchol.mutate(
      { name, sponsor: 'School' },
      {
        onSuccess: () => {
          toastSuccess('Scholarship created');
          setName('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }
  const award = useAwardScholarship();
  function awardNow() {
    award.mutate(
      { id: awardOpen!, body: { studentId: Number(studentId), sessionId: 1 } },
      {
        onSuccess: () => {
          toastSuccess('Awarded');
          setAwardOpen(null);
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Discounts & scholarships"
        actions={
          <SegmentedControl
            aria-label="Fees discounts tabs"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'discounts', label: 'Discounts' },
              { value: 'scholarships', label: 'Scholarships' },
            ]}
          />
        }
      />
      <div className="flex gap-2">
        <Input className="max-w-xs" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        {tab === 'discounts' ? (
          <Button type="button" disabled={!name || createDisc.isPending} onClick={addDiscount}>
            Add discount
          </Button>
        ) : (
          <Button type="button" disabled={!name || createSchol.isPending} onClick={addScholarship}>
            Add scholarship
          </Button>
        )}
      </div>
      {tab === 'discounts' ? (
        <QueryState isPending={discounts.isPending} error={discounts.error}>
          <ul className="space-y-2">
            {(discounts.data ?? []).map((d) => (
              <li key={d.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  {d.name} · {d.type} {d.value}
                </span>
                <StatusBadge status={d.isActive === false ? 'inactive' : 'active'} />
              </li>
            ))}
          </ul>
        </QueryState>
      ) : (
        <QueryState isPending={scholarships.isPending} error={scholarships.error}>
          <ul className="space-y-2">
            {(scholarships.data ?? []).map((s) => (
              <li key={s.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span>
                  {s.name} · {s.sponsor ?? '—'} · awards {s.awardCount ?? 0}
                </span>
                <Button size="sm" variant="outline" onClick={() => setAwardOpen(s.id)}>
                  Award
                </Button>
              </li>
            ))}
          </ul>
        </QueryState>
      )}
      <Dialog open={awardOpen != null} onOpenChange={(o) => !o && setAwardOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award scholarship</DialogTitle>
          </DialogHeader>
          <Label>Student ID</Label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          <Button type="button" disabled={!studentId || award.isPending} onClick={awardNow}>
            Award
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function InvoicesListPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const list = useInvoices({ page, status: status || undefined, q: q || undefined, campusId: campusQuery });
  const columns: DataTableColumn<Invoice>[] = [
    {
      id: 'number',
      header: 'Invoice',
      cell: (r) => (
        <Link className="font-mono text-primary hover:underline" href={`/admin/fees/invoices/${r.id}`}>
          {r.invoiceNumber ?? r.number ?? r.id}
        </Link>
      ),
    },
    { id: 'student', header: 'Student', cell: (r) => r.studentName ?? r.studentId },
    { id: 'total', header: 'Total', cell: (r) => <MoneyText minor={r.totalMinor} currency={r.currency} /> },
    { id: 'balance', header: 'Balance', cell: (r) => <MoneyText minor={r.balanceMinor} currency={r.currency} /> },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        actions={
          <div className="flex gap-2">
            <PermissionGate permission="fees.invoice.create">
              <Button asChild>
                <Link href="/admin/fees/invoices/new">Create invoice</Link>
              </Button>
            </PermissionGate>
            <PermissionGate permission="fees.invoice.generate-batch">
              <Button asChild variant="outline">
                <Link href="/admin/fees/invoices/batch">Generate batch</Link>
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <FilterBar search={q} onSearchChange={(v) => { setQ(v); setPage(1); }}>
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterBar>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function InvoiceCreatePage() {
  const router = useRouter();
  const search = useSearchParams();
  const [studentId, setStudentId] = useState(search.get('studentId') ?? '');
  const [amountMinor, setAmountMinor] = useState(0);
  const [description, setDescription] = useState('Tuition');
  const create = useCreateInvoice();
  function createNew(issue: boolean) {
    create.mutate(
      {
        body: {
          studentId: Number(studentId),
          lines: [{ description, quantity: 1, unitAmountMinor: amountMinor }],
        },
        issue,
      },
      {
        onSuccess: (inv) => {
          toastSuccess('Invoice saved');
          router.push(`/admin/fees/invoices/${inv.id}`);
        },
        onError: (e) => toastError('Could not create', e.message),
      },
    );
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Create invoice" />
      <div className="grid max-w-md gap-3 rounded-xl border border-border p-4">
        <div className="grid gap-1.5">
          <Label>Student ID</Label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label>Amount</Label>
          <MoneyInput valueMinor={amountMinor} onChangeMinor={setAmountMinor} />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={!studentId || create.isPending} onClick={() => createNew(false)}>
            Save draft
          </Button>
          <Button type="button" disabled={!studentId || create.isPending} onClick={() => createNew(true)}>
            Issue
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InvoiceBatchPage() {
  const [step, setStep] = useState(1);
  const { campusQuery } = useAdminCampus();
  const batch = useBatchInvoices();
  function confirmBatch() {
    batch.mutate(
      { campusId: campusQuery ? Number(campusQuery) : undefined },
      {
        onSuccess: (data) => {
          toastSuccess('Batch started');
          setStep(3);
          const rec = asRecord(data);
          toastSuccess(
            `Created ${str(rec?.createdCount) || '…'}, skipped ${str(rec?.skippedCount) || '…'}`,
          );
        },
        onError: (e) => toastError('Batch failed', e.message),
      },
    );
  }
  return (
    <div className="space-y-5">
      <PageHeader title="Generate invoice batch" />
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Scope uses the current campus filter.</p>
          <Button type="button" onClick={() => setStep(2)}>
            Preview
          </Button>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-3">
          <p className="text-sm">Confirm batch generation for the selected campus.</p>
          <Button type="button" disabled={batch.isPending} onClick={confirmBatch}>
            Confirm
          </Button>
        </div>
      ) : null}
      {step === 3 ? <p className="text-sm text-muted-foreground">Batch enqueued. Check invoices list shortly.</p> : null}
    </div>
  );
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: number }) {
  const inv = useInvoice(invoiceId);
  const [payOpen, setPayOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [amountMinor, setAmountMinor] = useState(0);
  const [method, setMethod] = useState('cash');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [tab, setTab] = useState<'payments' | 'adjustments' | 'reminders' | 'history'>('payments');

  useEffect(() => {
    if (payOpen) {
      setIdempotencyKey(newIdempotencyKey());
      setAmountMinor(inv.data?.balanceMinor ?? 0);
    }
  }, [payOpen, inv.data?.balanceMinor]);

  const issue = useIssueInvoice(invoiceId);
  function issueNow() {
    issue.mutate(undefined, {
      onSuccess: () => toastSuccess('Issued'),
      onError: (e) => toastError('Issue failed', e.message),
    });
  }
  const pay = useRecordPayment(invoiceId);
  function payNow() {
    pay.mutate(
      {
        body: { method, amountMinor, paidAt: new Date().toISOString() },
        idempotencyKey,
      },
      {
        onSuccess: () => {
          toastSuccess('Payment recorded');
          setPayOpen(false);
        },
        onError: (e) => toastError('Payment failed', e.message),
      },
    );
  }
  const checkout = useCreateCheckoutSession(invoiceId);
  function checkoutNow() {
    checkout.mutate(
      { body: { returnUrl: window.location.href }, idempotencyKey: newIdempotencyKey() },
      {
        onSuccess: (data) => {
          const url = str(asRecord(data)?.url) || str(asRecord(data)?.checkoutUrl);
          if (url) {
            void navigator.clipboard?.writeText(url);
            toastSuccess('Checkout link copied');
          } else toastSuccess('Checkout session created');
        },
        onError: (e) => toastError('Checkout failed', e.message),
      },
    );
  }
  const cancel = useCancelInvoice(invoiceId);
  function cancelNow(reason: string) {
    cancel.mutate(reason, {
      onSuccess: () => {
        toastSuccess('Cancelled');
        setCancelOpen(false);
      },
      onError: (e) => toastError('Cancel failed', e.message),
    });
  }
  const credit = useCreateCreditNote(invoiceId);
  function creditNow() {
    credit.mutate(
      { amountMinor: 100, reason: 'Adjustment' },
      {
        onSuccess: () => toastSuccess('Credit note added'),
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }
  const adjust = useCreateAdjustment(invoiceId);
  function adjustNow() {
    adjust.mutate(
      { amountMinor: 100, reason: 'Correction' },
      {
        onSuccess: () => toastSuccess('Adjustment added'),
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }

  const i = inv.data;

  return (
    <div className="space-y-5">
      <QueryState isPending={inv.isPending} error={inv.error}>
        {i ? (
          <>
            <PageHeader
              title={i.invoiceNumber ?? i.number ?? `Invoice #${i.id}`}
              description={`Student ${i.studentName ?? i.studentId}`}
              actions={<StatusBadge status={i.status} />}
            />
            <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
              <div className="space-y-4">
                <section className="rounded-xl border border-border p-4">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <MoneyText minor={i.totalMinor} currency={i.currency} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Paid</span>
                    <MoneyText minor={i.paidMinor} currency={i.currency} />
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Balance</span>
                    <MoneyText minor={i.balanceMinor} currency={i.currency} />
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
                    {(i.lines ?? []).map((line, idx) => {
                      const r = asRecord(line) ?? {};
                      return (
                        <li key={idx} className="flex justify-between gap-2">
                          <span>{str(r.description) || 'Line'}</span>
                          <MoneyText minor={typeof r.amountMinor === 'number' ? r.amountMinor : typeof r.unitAmountMinor === 'number' ? r.unitAmountMinor : null} />
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <SegmentedControl
                  aria-label="Invoice tabs"
                  value={tab}
                  onValueChange={setTab}
                  options={[
                    { value: 'payments', label: 'Payments' },
                    { value: 'adjustments', label: 'Adjustments' },
                    { value: 'reminders', label: 'Reminders' },
                    { value: 'history', label: 'History' },
                  ]}
                />
                <p className="text-sm text-muted-foreground">
                  {tab === 'payments'
                    ? `${(i.payments ?? []).length} payment(s) on this invoice.`
                    : `${tab} details appear as the API returns nested data.`}
                </p>
              </div>
              <aside className="space-y-2 rounded-xl border border-border p-3">
                <p className="text-sm font-medium">Actions</p>
                {i.status === 'draft' ? (
                  <PermissionGate permission="fees.invoice.issue">
                    <Button className="w-full" size="sm" onClick={issueNow}>
                      Issue
                    </Button>
                  </PermissionGate>
                ) : null}
                <PermissionGate permission="fees.payment.record">
                  <Button className="w-full" size="sm" variant="outline" onClick={() => setPayOpen(true)}>
                    Record payment
                  </Button>
                </PermissionGate>
                <PermissionGate permission="fees.payment.initiate">
                  <Button className="w-full" size="sm" variant="outline" onClick={checkoutNow}>
                    Pay online link
                  </Button>
                </PermissionGate>
                <PermissionGate permission="fees.credit-note.create">
                  <Button className="w-full" size="sm" variant="outline" onClick={creditNow}>
                    Credit note
                  </Button>
                </PermissionGate>
                <PermissionGate permission="fees.adjustment.create">
                  <Button className="w-full" size="sm" variant="outline" onClick={adjustNow}>
                    Adjustment
                  </Button>
                </PermissionGate>
                <PermissionGate permission="fees.invoice.cancel">
                  <Button className="w-full" size="sm" variant="outline" onClick={() => setCancelOpen(true)}>
                    Cancel
                  </Button>
                </PermissionGate>
                <Button asChild className="w-full" size="sm" variant="ghost">
                  <Link href={`/admin/students/${i.studentId}/fees`}>Student fees</Link>
                </Button>
              </aside>
            </div>
          </>
        ) : null}
      </QueryState>
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Method</Label>
              <select
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="pos">POS</option>
                <option value="bank-transfer">Bank transfer</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Amount</Label>
              <MoneyInput valueMinor={amountMinor} onChangeMinor={setAmountMinor} />
            </div>
            <p className="text-xs text-muted-foreground">Idempotency key set when dialog opened.</p>
            <Button type="button" disabled={pay.isPending} onClick={payNow}>
              Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ReasonDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel invoice?"
        confirmLabel="Cancel invoice"
        destructive
        isPending={cancel.isPending}
        onConfirm={cancelNow}
      />
    </div>
  );
}

export function PaymentsPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const list = usePayments({ page, campusId: campusQuery });
  const totalMinor = useMemo(
    () => (list.data?.data ?? []).reduce((s, p) => s + (p.amountMinor || 0), 0),
    [list.data],
  );
  const resend = useResendReceipt();
  function resendReceiptNow(id: number) {
    resend.mutate(id, {
      onSuccess: () => toastSuccess('Receipt resent'),
      onError: (e) => toastError('Failed', e.message),
    });
  }
  const columns: DataTableColumn<Payment>[] = [
    { id: 'receipt', header: 'Receipt', cell: (r) => r.receiptNumber ?? r.id },
    { id: 'student', header: 'Student', cell: (r) => r.studentName ?? r.studentId ?? '—' },
    { id: 'method', header: 'Method', cell: (r) => r.method ?? '—' },
    { id: 'amount', header: 'Amount', cell: (r) => <MoneyText minor={r.amountMinor} /> },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status ?? 'posted'} /> },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <ReceiptLink paymentId={r.id} href={r.receiptUrl} />
          <Button size="sm" variant="ghost" onClick={() => resendReceiptNow(r.id)}>
            Resend
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Payments" />
      <p className="text-sm text-muted-foreground">
        Page total: <MoneyText minor={totalMinor} />
      </p>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

function ReceiptLink({ paymentId, href }: { paymentId: number; href?: string | null }) {
  const [url, setUrl] = useState(href ?? null);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        if (url) {
          window.open(url, '_blank');
          return;
        }
        try {
          const res = await getPaymentReceipt(paymentId);
          const next = res.url ?? null;
          setUrl(next);
          if (next) window.open(next, '_blank');
          else toastError('No receipt URL');
        } catch (e) {
          toastError('Receipt failed', e instanceof Error ? e.message : undefined);
        }
      }}
    >
      Receipt
    </Button>
  );
}

export function ReconciliationPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ReconciliationException | null>(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [dismissOpen, setDismissOpen] = useState(false);
  const list = useReconciliationExceptions({ page });
  const match = useMatchException();
  function matchNow() {
    match.mutate(
      { id: selected!.id, invoiceId: Number(invoiceId) },
      {
        onSuccess: () => {
          toastSuccess('Matched');
          setSelected(null);
        },
        onError: (e) => toastError('Match failed', e.message),
      },
    );
  }
  const dismiss = useDismissException();
  function dismissNow(reason: string) {
    dismiss.mutate(
      { id: selected!.id, reason },
      {
        onSuccess: () => {
          toastSuccess('Dismissed');
          setDismissOpen(false);
          setSelected(null);
        },
        onError: (e) => toastError('Dismiss failed', e.message),
      },
    );
  }
  const importStmt = useImportBankStatement();
  function importStatement() {
    importStmt.mutate(
      { reference: `import-${Date.now()}`, lines: [] },
      {
        onSuccess: () => toastSuccess('Import started'),
        onError: (e) => toastError('Import failed', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reconciliation"
        actions={
          <PermissionGate permission="fees.reconciliation.import">
            <Button type="button" variant="outline" onClick={importStatement}>
              Import bank statement
            </Button>
          </PermissionGate>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <QueryState isPending={list.isPending} error={list.error}>
          <ul className="space-y-2">
            {(list.data?.data ?? []).map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selected?.id === ex.id ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSelected(ex)}
                >
                  <MoneyText minor={ex.amountMinor} /> · {ex.reference ?? '—'} · {ex.date ?? ''}
                </button>
              </li>
            ))}
          </ul>
        </QueryState>
        <div className="rounded-xl border border-border p-4 text-sm">
          {selected ? (
            <div className="space-y-3">
              <p>
                Exception #{selected.id} · <MoneyText minor={selected.amountMinor} />
              </p>
              <Label>Match invoice ID</Label>
              <Input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
              <div className="flex gap-2">
                <Button type="button" disabled={!invoiceId || match.isPending} onClick={matchNow}>
                  Match
                </Button>
                <Button type="button" variant="outline" onClick={() => setDismissOpen(true)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Select an exception.</p>
          )}
        </div>
      </div>
      <ReasonDialog
        open={dismissOpen}
        onOpenChange={setDismissOpen}
        title="Dismiss exception?"
        confirmLabel="Dismiss"
        isPending={dismiss.isPending}
        onConfirm={dismissNow}
      />
    </div>
  );
}

export function DebtorsPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const list = useDebtors({ page, campusId: campusQuery });
  const remind = useSendDebtorReminders();
  function sendReminders() {
    remind.mutate(
      { studentIds: selected },
      {
        onSuccess: () => toastSuccess('Reminders queued'),
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }
  const columns: DataTableColumn<DebtorRow & { id: number }>[] = [
    {
      id: 'sel',
      header: '',
      cell: (r) => (
        <input
          type="checkbox"
          checked={selected.includes(r.studentId)}
          onChange={(e) =>
            setSelected((prev) =>
              e.target.checked ? [...prev, r.studentId] : prev.filter((id) => id !== r.studentId),
            )
          }
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      id: 'student',
      header: 'Student',
      cell: (r) => (
        <Link className="text-primary hover:underline" href={`/admin/students/${r.studentId}/fees`}>
          {r.studentName ?? r.studentId}
        </Link>
      ),
    },
    { id: 'class', header: 'Class', cell: (r) => r.className ?? '—' },
    { id: 'balance', header: 'Balance', cell: (r) => <MoneyText minor={r.balanceMinor} /> },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Debtors"
        actions={
          <PermissionGate permission="fees.reminder.send">
            <Button type="button" disabled={!selected.length || remind.isPending} onClick={sendReminders}>
              Send reminders ({selected.length})
            </Button>
          </PermissionGate>
        }
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable
          columns={columns}
          rows={(list.data?.data ?? []).map((r) => ({ ...r, id: r.studentId }))}
          density={density}
        />
      </QueryState>
    </div>
  );
}

export function ClearancePage() {
  const settings = useSettingsGroup('fee-clearance');
  const [mode, setMode] = useState('zero_balance');
  const [maxArrearsMinor, setMaxArrearsMinor] = useState(0);
  const [testStudentId, setTestStudentId] = useState('');
  const [testResult, setTestResult] = useState<unknown>(null);

  useEffect(() => {
    const v = settings.data?.value ?? {};
    setMode(str(v.mode) || 'zero_balance');
    setMaxArrearsMinor(typeof v.maxArrearsMinor === 'number' ? v.maxArrearsMinor : 0);
  }, [settings.data]);

  const save = useSaveSettingsGroup('fee-clearance');
  function saveClearance() {
    save.mutate(
      { mode, maxArrearsMinor, currency: 'NGN' },
      {
        onSuccess: () => toastSuccess('Clearance settings saved'),
        onError: (e) => toastError('Failed', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Fee clearance" description="What gates results/report cards. Changes are audited." />
      <QueryState isPending={settings.isPending} error={settings.error}>
        <div className="grid max-w-lg gap-3 rounded-xl border border-border p-4">
          <div className="grid gap-1.5">
            <Label>Mode</Label>
            <select
              className="h-10 rounded-md border border-border bg-background px-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="none">None</option>
              <option value="zero_balance">Zero balance</option>
              <option value="max_arrears_minor">Max arrears</option>
            </select>
          </div>
          {mode === 'max_arrears_minor' ? (
            <div className="grid gap-1.5">
              <Label>Max arrears</Label>
              <MoneyInput valueMinor={maxArrearsMinor} onChangeMinor={setMaxArrearsMinor} />
            </div>
          ) : null}
          <PermissionGate permission="config.setting.update">
            <Button type="button" disabled={save.isPending} onClick={saveClearance}>
              Save
            </Button>
          </PermissionGate>
        </div>
      </QueryState>
      <section className="max-w-lg space-y-2 rounded-xl border border-border p-4">
        <h2 className="font-heading font-semibold">Test student</h2>
        <Input placeholder="Student ID" value={testStudentId} onChange={(e) => setTestStudentId(e.target.value)} />
        <Button
          type="button"
          variant="outline"
          disabled={!testStudentId}
          onClick={async () => {
            try {
              const res = await getFeeClearance(Number(testStudentId));
              setTestResult(res);
            } catch (e) {
              toastError('Test failed', e instanceof Error ? e.message : undefined);
            }
          }}
        >
          Run test
        </Button>
        {testResult ? (
          <pre className="overflow-auto rounded-md bg-muted/40 p-2 text-xs">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}

export function StudentAccountPanel({ studentId }: { studentId: number }) {
  const account = useStudentAccount(studentId);
  return (
    <QueryState isPending={account.isPending} error={account.error}>
      <div className="space-y-3">
        <p className="text-sm">
          Balance: <MoneyText minor={account.data?.balanceMinor} currency={account.data?.currency} />
        </p>
        <SignedFileLink href={account.data?.statementUrl}>Print statement PDF</SignedFileLink>
        <ul className="space-y-1 text-sm">
          {(account.data?.entries ?? []).map((e, i) => {
            const r = asRecord(e) ?? {};
            return (
              <li key={i} className="flex justify-between border-b border-border/60 py-1">
                <span>{str(r.description) || str(r.type) || 'Entry'}</span>
                <MoneyText minor={typeof r.amountMinor === 'number' ? r.amountMinor : null} />
              </li>
            );
          })}
        </ul>
      </div>
    </QueryState>
  );
}
