'use client';

import { useMemo } from 'react';
import { usePortalInvoices } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { formatMoneyMinor } from '@/lib/money/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentFees() {
  const query = usePortalInvoices();
  const root = asRecord(query.data);
  const balances = asArray(root?.balances ?? root?.balance);
  const invoices = asArray(root?.invoices ?? (Array.isArray(query.data) ? query.data : []));

  const balanceRows = useMemo(
    () =>
      balances
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [balances],
  );

  const invoiceRows = useMemo(
    () =>
      invoices
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [invoices],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fees</h1>
        <p className="text-sm text-muted-foreground">
          For information only. Ask the school office if you have questions.
        </p>
      </div>

      <QueryState isPending={query.isPending} error={query.error}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {balanceRows.length === 0 ? (
              <p className="text-muted-foreground">No balance details.</p>
            ) : (
              balanceRows.map((row, index) => (
                <div key={index} className="flex justify-between">
                  <span>{str(row.label ?? row.termName ?? 'Balance')}</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoneyMinor(num(row.amountMinor ?? row.balanceMinor), str(row.currency, 'NGN'))}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <ul className="space-y-2">
          {invoiceRows.map((invoice, index) => (
            <li
              key={num(invoice.id, index)}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{str(invoice.number ?? invoice.reference, 'Invoice')}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {str(invoice.status ?? invoice.statusCode, 'status')}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">
                  {formatMoneyMinor(
                    num(invoice.amountMinor ?? invoice.totalMinor),
                    str(invoice.currency, 'NGN'),
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}
