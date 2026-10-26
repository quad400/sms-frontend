'use client';

import { use } from 'react';
import { TimetableBuilderPage } from '@/features/admin/components/academics-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TimetableBuilderPage timetableId={Number(id)} />;
}
