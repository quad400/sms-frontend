'use client';

import { use } from 'react';
import { StaffForm } from '@/features/admin/components/staff-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffForm staffId={Number(id)} />;
}
