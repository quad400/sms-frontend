'use client';

import { use } from 'react';
import { InvoiceDetailPage } from '@/features/admin/components/fees-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceDetailPage invoiceId={Number(id)} />;
}
