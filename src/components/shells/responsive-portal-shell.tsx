'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { SidebarUserMenu } from '@/components/shells/sidebar-user-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSession } from '@/lib/auth/permissions';
import type { SessionUser } from '@/lib/auth/types';
import { motion } from '@/lib/motion/classes';
import { cn } from '@/lib/utils/cn';

export type PortalNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Required permission; omit to always show when listed. */
  permission?: string;
  /** Include in the mobile bottom tab row (max ~3 + More). */
  tab?: boolean;
};

function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

function filterByPermission(items: PortalNavItem[], can: (p: string) => boolean): PortalNavItem[] {
  return items.filter((item) => !item.permission || can(item.permission));
}

export function ResponsivePortalShell({
  title,
  items,
  contentMaxWidthClassName = 'max-w-[960px]',
  children,
}: {
  title: string;
  items: PortalNavItem[];
  contentMaxWidthClassName?: string;
  children: ReactNode;
}) {
  const { user, can } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = useMemo(() => filterByPermission(items, can), [items, can]);
  const tabs = useMemo(() => visible.filter((item) => item.tab), [visible]);
  const moreItems = useMemo(() => visible.filter((item) => !item.tab), [visible]);
  const moreActive = moreItems.some((item) => isActivePath(pathname, item.href));

  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar title={title} items={visible} user={user} onLogout={() => void logout()} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground md:hidden">{title}</p>
            <p className="truncate text-xs text-muted-foreground">Hi, {user.displayName}</p>
          </div>
          <div className="md:hidden">
            <SidebarUserMenu
              user={user}
              onLogout={() => void logout()}
              className="w-auto max-w-[200px]"
            />
          </div>
        </header>

        <main
          className={cn(
            'mx-auto w-full flex-1 p-4 pb-24 md:p-6 md:pb-6',
            contentMaxWidthClassName,
            motion.shellMain,
          )}
        >
          {children}
        </main>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-1.5">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors',
                    active ? 'bg-brand text-brand-foreground' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex w-full flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors',
                moreActive || moreOpen
                  ? 'bg-brand text-brand-foreground'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-none">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-1 pb-6">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      active ? 'bg-brand text-brand-foreground' : 'hover:bg-muted',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DesktopSidebar({
  title,
  items,
  user,
  onLogout,
}: {
  title: string;
  items: PortalNavItem[];
  user: SessionUser;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground"
        >
          {title.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground">Student portal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-brand text-brand-foreground' : 'hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <SidebarUserMenu user={user} onLogout={onLogout} />
      </div>
    </aside>
  );
}
