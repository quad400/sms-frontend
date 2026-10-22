import type { ReactNode } from 'react';
import { PublicShell } from '@/components/shells/public-shell';
import { fetchPublicSchoolProfile } from '@/lib/school/public-profile';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const profile = await fetchPublicSchoolProfile();
  return <PublicShell profile={profile}>{children}</PublicShell>;
}
