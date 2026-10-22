import type { ReactNode } from 'react';
import { AuthenticatedPortalLayout } from '@/components/shells/authenticated-portal-layout';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedPortalLayout title="Staff" expectedUserType="staff" nextPath="/staff">
      {children}
    </AuthenticatedPortalLayout>
  );
}
