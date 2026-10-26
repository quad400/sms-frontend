'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { UserX } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useActiveChild } from '../hooks/use-active-child';
import { QueryState } from '../lib/shared';

/** Ensures the URL studentId is a linked child before rendering the page. */
export function ChildGate({
  studentId,
  children,
}: {
  studentId: number;
  children: ReactNode;
}) {
  const { children: linked, isPending, error, refetch } = useActiveChild();
  const linkedIds = linked.map((row) => row.id);
  const allowed = linkedIds.includes(studentId);

  return (
    <QueryState isPending={isPending} error={error} onRetry={refetch}>
      {!allowed ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
          <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <UserX className="size-6" aria-hidden />
          </span>
          <div className="space-y-1">
            <h1 className="font-heading text-lg font-semibold">Child not available</h1>
            <p className="text-sm text-muted-foreground">
              This student is not linked to your parent account, or the link was removed.
            </p>
          </div>
          <Link href="/parent" className={buttonVariants({ variant: 'outline' })}>
            Back to home
          </Link>
        </div>
      ) : (
        children
      )}
    </QueryState>
  );
}
