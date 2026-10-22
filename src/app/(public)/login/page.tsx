import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { fetchPublicSchoolProfile } from '@/lib/school/public-profile';

export default async function LoginPage() {
  const profile = await fetchPublicSchoolProfile();
  return (
    <Suspense fallback={<div className="w-full max-w-md rounded-xl border border-border bg-card p-6" />}>
      <LoginForm schoolName={profile.name} />
    </Suspense>
  );
}
