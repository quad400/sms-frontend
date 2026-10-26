'use client';

import type { ReactNode } from 'react';
import { useActiveChild } from '../hooks/use-active-child';
import { ChildGate } from './child-gate';

export function ChildPage({
  studentId,
  children,
}: {
  studentId: number;
  children: (ctx: { studentId: number; child: ReturnType<typeof useActiveChild>['activeChild'] }) => ReactNode;
}) {
  const { children: linked } = useActiveChild();
  const child = linked.find((row) => row.id === studentId) ?? null;
  return (
    <ChildGate studentId={studentId}>
      {children({ studentId, child })}
    </ChildGate>
  );
}
