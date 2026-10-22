import type { ReactNode } from 'react';
import { AuthenticatedPortalLayout } from '@/components/shells/authenticated-portal-layout';

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedPortalLayout title="Parent" expectedUserType="parent" nextPath="/parent">
      {children}
    </AuthenticatedPortalLayout>
  );
}
