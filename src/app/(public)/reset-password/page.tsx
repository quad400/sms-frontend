import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-xl border border-border bg-card p-6" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
