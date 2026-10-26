'use client';

import { use } from 'react';
import { PromotionsWizard } from '@/features/admin/components/promotions-page';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PromotionsWizard promotionId={Number(id)} />;
}
