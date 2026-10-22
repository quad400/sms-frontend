import type { ReactNode } from 'react';
import { AuthenticatedPortalLayout } from '@/components/shells/authenticated-portal-layout';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedPortalLayout title="Student" expectedUserType="student" nextPath="/student">
      {children}
    </AuthenticatedPortalLayout>
  );
}
