'use client';

import { use } from 'react';
import { StaffProfile } from '@/features/admin/components/staff/staff-profile';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <StaffProfile staffId={Number(id)} tab="leave" />;
}
