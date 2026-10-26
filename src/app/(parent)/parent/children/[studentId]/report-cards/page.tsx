'use client';

import { use } from 'react';
import { ChildPage, ParentReportCards } from '@/features/parent';

export default function ParentReportCardsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = use(params);
  const studentId = Number(raw);
  return (
    <ChildPage studentId={studentId}>
      {({ studentId: id, child }) => <ParentReportCards studentId={id} child={child} />}
    </ChildPage>
  );
}
