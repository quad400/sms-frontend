'use client';

import { use } from 'react';
import { RegisterDetailPage } from '@/features/admin/components/attendance-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RegisterDetailPage registerId={Number(id)} />;
}
