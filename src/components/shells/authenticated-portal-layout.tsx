import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell, type AppShellRole } from '@/components/shells/app-shell';
import { PortalShell } from '@/components/shells/portal-shell';
import { SessionProvider } from '@/lib/auth/permissions';
import { fetchSessionUser } from '@/lib/auth/session';
import { portalHomeForUserType } from '@/lib/auth/portal';
import type { AuthUserType } from '@/lib/auth/types';
import { fetchPublicSchoolProfile } from '@/lib/school/public-profile';

const APP_SHELL_ROLES: AppShellRole[] = ['student', 'staff', 'parent', 'admin'];

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

  const role =
    expectedUserType && APP_SHELL_ROLES.includes(expectedUserType as AppShellRole)
      ? (expectedUserType as AppShellRole)
      : null;

  if (role) {
    const school = await fetchPublicSchoolProfile();
    return (
      <SessionProvider user={user}>
        <AppShell
          role={role}
          chrome={{
            schoolName: school.name,
            timezone: school.timezone,
          }}
        >
          {children}
        </AppShell>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider user={user}>
      <PortalShell title={title}>{children}</PortalShell>
    </SessionProvider>
  );
}
