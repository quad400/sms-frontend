'use client';

import { use } from 'react';
import { ScoreSheetPage } from '@/features/admin/components/assessment-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ScoreSheetPage assessmentId={Number(id)} />;
}
