'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ShellCommandPalette } from '@/components/shells/shell-command-palette';
import { ShellMobileNav } from '@/components/shells/shell-mobile-nav';
import {
  filterShellNavGroups,
  filterShellNavItems,
  flattenShellNav,
  type ShellNavGroup,
  type ShellNavItem,
} from '@/components/shells/shell-nav';
import { ShellSidebar } from '@/components/shells/shell-sidebar';
import { ShellTopBar } from '@/components/shells/shell-topbar';
import { useSidebarExpanded } from '@/components/shells/use-sidebar-expanded';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSession } from '@/lib/auth/permissions';
import { motion } from '@/lib/motion/classes';
import { cn } from '@/lib/utils/cn';

export type RoleShellChrome = {
  schoolName: string;
  timezone: string;
  academicPeriodLabel?: string | null;
  notificationCount?: number;
};

export type RoleShellConfig = {
  homeHref: string;
  accountHref: string;
  portalLabel: string;
  storageKey: string;
  contentWidth?: 'admin';
  navGroups: ShellNavGroup[];
  moreExtra?: ShellNavItem[];
  /** Max primary tabs on the phone bar (plus More). */
  maxTabs?: number;
  showUserMenu?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  notificationsHref?: string;
  title?: string;
};

export function RoleShell({
  children,
  chrome,
  config,
  isModuleEnabled = () => true,
  topBarLeading,
  topBarTrailing,
}: {
  children: ReactNode;
  chrome?: RoleShellChrome;
  config: RoleShellConfig;
  isModuleEnabled?: (flag: string) => boolean;
  topBarLeading?: ReactNode;
  topBarTrailing?: ReactNode;
}) {
  const { user, can } = useSession();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMobile, sidebarExpanded, setExpanded, showDocked, railCollapsed, navSheetOpen } =
    useSidebarExpanded(config.storageKey);

  const groups = useMemo(
    () => filterShellNavGroups(config.navGroups, can, isModuleEnabled),
    [can, config.navGroups, isModuleEnabled],
  );
  const flat = useMemo(() => flattenShellNav(groups), [groups]);
  const tabs = useMemo(() => flat.filter((item) => item.tab), [flat]);
  const moreExtra = useMemo(
    () => filterShellNavItems(config.moreExtra ?? [], can, isModuleEnabled),
    [can, config.moreExtra, isModuleEnabled],
  );
  const moreGroups = useMemo(() => {
    const groupsWithoutTabs = groups
      .map((group) => ({ ...group, items: group.items.filter((item) => !item.tab) }))
      .filter((group) => group.items.length > 0);
    return moreExtra.length > 0
      ? [...groupsWithoutTabs, { label: 'More', items: moreExtra }]
      : groupsWithoutTabs;
  }, [groups, moreExtra]);
  const contentWidthClass = config.contentWidth === 'admin' ? 'max-w-[1280px]' : '';

  const schoolName = chrome?.schoolName?.trim() || 'School';
  const timezone = chrome?.timezone?.trim() || 'UTC';

  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  if (!user) return null;

  const sidebarProps = {
    schoolName,
    portalLabel: config.portalLabel,
    homeHref: config.homeHref,
    groups,
    user,
    onLogout: () => void logout(),
    showUserMenu: config.showUserMenu,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* md+: docked (icon rail on tablet; open/collapsible on lg+) */}
      {showDocked ? (
        <ShellSidebar {...sidebarProps} collapsed={railCollapsed} presentation="docked" />
      ) : null}

      {/* md–lg: overlay with labels when toggled open */}
      <Sheet open={navSheetOpen} onOpenChange={setExpanded}>
        <SheetContent side="left" className="w-[min(100%,280px)] gap-0 p-0 sm:max-w-[280px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <ShellSidebar
            {...sidebarProps}
            collapsed={false}
            presentation="overlay"
            onNavigate={() => setExpanded(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <ShellTopBar
          user={user}
          timezone={timezone}
          title={config.title}
          accountHref={config.accountHref}
          academicPeriodLabel={chrome?.academicPeriodLabel}
          notificationCount={chrome?.notificationCount ?? 0}
          notificationsHref={config.notificationsHref}
          sidebarCollapsed={!sidebarExpanded}
          onToggleSidebar={isMobile ? undefined : () => setExpanded(!sidebarExpanded)}
          onOpenSearch={config.enableSearch ? () => setSearchOpen(true) : undefined}
          searchPlaceholder={config.searchPlaceholder}
          leading={topBarLeading}
          trailing={topBarTrailing}
          onLogout={() => void logout()}
        />

        <main
          className={cn(
            'mx-auto w-full flex-1 p-4 md:p-6',
            contentWidthClass,
            isMobile ? 'pb-24' : 'pb-8',
            motion.shellMain,
          )}
        >
          {children}
        </main>
      </div>

      {/* < md: bottom tab bar only */}
      {isMobile ? (
        <ShellMobileNav
          homeHref={config.homeHref}
          tabs={tabs}
          moreGroups={moreGroups}
          maxTabs={config.maxTabs ?? 3}
        />
      ) : null}

      {config.enableSearch ? (
        <ShellCommandPalette
          open={searchOpen}
          onOpenChange={setSearchOpen}
          groups={groups}
          placeholder={config.searchPlaceholder}
        />
      ) : null}
    </div>
  );
}
