'use client';

import { EmptyState } from '@/components/patterns/empty-state';
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
        <EmptyState
          icon={UserX}
          title="Child not available"
          description="This student is not linked to your parent account, or the link was removed."
          className="mx-auto max-w-md bg-card shadow-[var(--shadow-card)]"
          action={
            <Link href="/parent" className={buttonVariants({ variant: 'outline' })}>
              Back to home
            </Link>
          }
        />
      ) : (
        children
      )}
    </QueryState>
  );
}
