'use client';

import { use } from 'react';
import { ChildPage, ParentResults } from '@/features/parent';

export default function ParentResultsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = use(params);
  const studentId = Number(raw);
  return (
    <ChildPage studentId={studentId}>
      {({ studentId: id, child }) => <ParentResults studentId={id} child={child} />}
    </ChildPage>
  );
}
