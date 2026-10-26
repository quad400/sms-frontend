import { Suspense } from 'react';
import { ParentPaymentReturn } from '@/features/parent';

export default function ParentPaymentReturnPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <ParentPaymentReturn />
    </Suspense>
  );
}
