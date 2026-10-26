'use client';

import { use } from 'react';
import { ClassDetailPage } from '@/features/admin/components/structure';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ClassDetailPage classId={Number(id)} />;
}
