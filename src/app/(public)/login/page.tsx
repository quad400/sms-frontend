import { Suspense } from 'react';
import { Loader } from '@/components/patterns/loader';
import { LoginForm } from '@/features/auth';
import { fetchPublicSchoolProfile } from '@/lib/school/public-profile';

export default async function LoginPage() {
  const profile = await fetchPublicSchoolProfile();
  return (
    <Suspense fallback={<Loader className="w-full max-w-md" rows={2} />}>
      <LoginForm schoolName={profile.name} />
    </Suspense>
  );
}
