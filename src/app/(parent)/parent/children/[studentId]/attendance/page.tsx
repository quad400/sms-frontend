'use client';

import { use } from 'react';
import { ChildPage, ParentAttendance } from '@/features/parent';

export default function ParentAttendancePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId: raw } = use(params);
  const studentId = Number(raw);
  return (
    <ChildPage studentId={studentId}>
      {({ studentId: id, child }) => <ParentAttendance studentId={id} child={child} />}
    </ChildPage>
  );
}
