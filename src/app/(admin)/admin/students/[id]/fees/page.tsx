'use client';

import { use } from 'react';
import { StudentProfile } from '@/features/admin/components/student-profile';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentProfile studentId={Number(id)} tab="fees" />;
}
