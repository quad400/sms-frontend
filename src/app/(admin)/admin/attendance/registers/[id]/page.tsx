'use client';

import { use } from 'react';
import { RegisterDetail } from '@/features/admin/components/attendance/register-detail';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RegisterDetail registerId={Number(id)} />;
}
