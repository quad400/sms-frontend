'use client';

import { use } from 'react';
import { StudentForm } from '@/features/admin/components/student-form';

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StudentForm studentId={Number(id)} />;
}
