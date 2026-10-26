'use client';

import { use } from 'react';
import { ApplicationDetailPage } from '@/features/admin/components/admissions-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ApplicationDetailPage applicationId={Number(id)} />;
}
