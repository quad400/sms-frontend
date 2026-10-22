import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { QueryProvider } from '@/components/providers/query-provider';
import { PortalShell } from '@/components/shells/portal-shell';
import { StudentShell } from '@/components/shells/student-shell';
import { SessionProvider } from '@/lib/auth/permissions';
import { fetchSessionUser } from '@/lib/auth/session';
import { portalHomeForUserType } from '@/lib/auth/portal';
import type { AuthUserType } from '@/lib/auth/types';

export async function AuthenticatedPortalLayout({
  title,
  expectedUserType,
  nextPath,
  children,
}: {
  title: string;
  expectedUserType?: AuthUserType;
  nextPath: string;
  children: ReactNode;
}) {
  const user = await fetchSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (expectedUserType && user.userType !== expectedUserType) {
    redirect(portalHomeForUserType(user.userType));
  }

  const shell =
    expectedUserType === 'student' ? (
      <StudentShell>{children}</StudentShell>
    ) : (
      <PortalShell title={title}>{children}</PortalShell>
    );

  return (
    <SessionProvider user={user}>
      <QueryProvider>{shell}</QueryProvider>
    </SessionProvider>
  );
}
