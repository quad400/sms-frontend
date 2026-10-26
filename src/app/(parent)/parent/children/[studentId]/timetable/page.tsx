'use client';

import { use } from 'react';
import { ChildPage, ParentTimetable } from '@/features/parent';

export default function ParentTimetablePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = use(params);
  const studentId = Number(raw);
  return (
    <ChildPage studentId={studentId}>
      {({ studentId: id, child }) => <ParentTimetable studentId={id} child={child} />}
    </ChildPage>
  );
}
