import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/shells/portal-shell';
import { canAccessItPortal } from '@/lib/auth/portal';
import { SessionProvider } from '@/lib/auth/permissions';
import { fetchSessionUser } from '@/lib/auth/session';

export default async function ItLayout({ children }: { children: ReactNode }) {
  const user = await fetchSessionUser();
  if (!user) {
    redirect('/login?next=/it');
  }
  if (!canAccessItPortal(user.permissions)) {
    redirect(user.userType === 'admin' ? '/admin' : '/login');
  }

  return (
    <SessionProvider user={user}>
      <PortalShell title="IT">{children}</PortalShell>
    </SessionProvider>
  );
}
