import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { formatMoneyMinor } from '@/lib/money/format';
import { cn } from '@/lib/utils/cn';
import type { BalanceRow } from '../types';

export function WithheldPayPanel({
  balances,
  feesHref,
  className,
}: {
  balances: BalanceRow[];
  feesHref: string;
  className?: string;
}) {
  const primary = balances.find((row) => row.outstandingMinor > 0) ?? balances[0];
  const amount =
    primary && primary.outstandingMinor > 0
      ? formatMoneyMinor(primary.outstandingMinor, primary.currency)
      : null;

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border bg-muted px-5 py-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-start',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground">
        <ShieldAlert className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Results are temporarily withheld</p>
          <p className="text-sm text-muted-foreground">
            The school is holding results until fees are cleared
            {amount ? (
              <>
                . Amount owing: <span className="font-semibold tabular-nums text-foreground">{amount}</span>
              </>
            ) : (
              '.'
            )}
          </p>
        </div>
        <Link href={feesHref} className={buttonVariants({ size: 'sm' })}>
          Pay now
        </Link>
      </div>
    </div>
  );
}
