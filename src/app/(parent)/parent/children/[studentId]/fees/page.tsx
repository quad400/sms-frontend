'use client';

import { use } from 'react';
import { ChildPage, ParentFees } from '@/features/parent';

export default function ParentFeesPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = use(params);
  const studentId = Number(raw);
  return (
    <ChildPage studentId={studentId}>
      {({ studentId: id, child }) => <ParentFees studentId={id} child={child} />}
    </ChildPage>
  );
}
