import { Suspense } from 'react';
import { Loader } from '@/components/patterns/loader';
import { ResetPasswordForm } from '@/features/auth';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader className="w-full max-w-md" rows={2} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
