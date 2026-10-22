import type { ReactNode } from 'react';
import { AuthenticatedPortalLayout } from '@/components/shells/authenticated-portal-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedPortalLayout title="Admin" expectedUserType="admin" nextPath="/admin">
      {children}
    </AuthenticatedPortalLayout>
  );
}
