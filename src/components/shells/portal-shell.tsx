'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppSidebar, buildPortalNavGroups } from '@/components/shells/app-sidebar';
import { SidebarUserMenu } from '@/components/shells/sidebar-user-menu';
import { useSession } from '@/lib/auth/permissions';
import { canAccessItPortal, portalHomeForUserType } from '@/lib/auth/portal';
import { motion } from '@/lib/motion/classes';
import { cn } from '@/lib/utils/cn';

export function PortalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { user } = useSession();
  const router = useRouter();

  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

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
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground md:hidden">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              Signed in as {user.displayName}
            </p>
          </div>
          <div className="md:hidden">
            <SidebarUserMenu user={user} onLogout={() => void logout()} className="w-auto max-w-[220px]" />
          </div>
        </header>

        <main className={cn('mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-6', motion.shellMain)}>
          {children}
        </main>
      </div>
    </div>
  );
}
