import { Loader } from '@/components/patterns/loader';
import { Suspense } from 'react';
import { ParentPaymentReturn } from '@/features/parent';

export default function ParentPaymentReturnPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ParentPaymentReturn />
    </Suspense>
  );
}
