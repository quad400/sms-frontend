'use client';

import { use } from 'react';
import { GuardianDetail } from '@/features/admin/components/guardians-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GuardianDetail guardianId={Number(id)} />;
}
