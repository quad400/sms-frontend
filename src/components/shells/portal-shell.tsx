'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppSidebar, buildPortalNavGroups } from '@/components/shells/app-sidebar';
import { ShellTopBar } from '@/components/shells/shell-topbar';
import { useSession } from '@/lib/auth/permissions';
import { canAccessItPortal, portalHomeForUserType } from '@/lib/auth/portal';
import { motion } from '@/lib/motion/classes';
import { cn } from '@/lib/utils/cn';

export function PortalShell({
  title,
  timezone = 'UTC',
  children,
}: {
  title: string;
  timezone?: string;
  children: ReactNode;
}) {
  const { user } = useSession();
  const router = useRouter();

  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const homeHref = user ? portalHomeForUserType(user.userType) : '/';
  /** IT/legacy portal has no dedicated account route — fall back to home. */
  const accountHref = homeHref;

  const groups = useMemo(() => {
    if (!user) {
      return [];
    }
    return buildPortalNavGroups({
      home: portalHomeForUserType(user.userType),
      showIt: canAccessItPortal(user.permissions),
    });
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        title={title}
        user={user}
        groups={groups}
        onLogout={() => void logout()}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopBar
          user={user}
          timezone={timezone}
          title={title}
          accountHref={accountHref}
          onLogout={() => void logout()}
        />

        <main className={cn('mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-6', motion.shellMain)}>
          {children}
        </main>
      </div>
    </div>
  );
}
