'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Landmark } from 'lucide-react';
import { SidebarUserMenu } from '@/components/shells/sidebar-user-menu';
import {
  isActiveShellPath,
  type ShellNavGroup,
} from '@/components/shells/shell-nav';
import type { SessionUser } from '@/lib/auth/types';
import { cn } from '@/lib/utils/cn';

export function ShellSidebar({
  schoolName,
  portalLabel,
  homeHref,
  groups,
  user,
  onLogout,
  collapsed = false,
  presentation = 'docked',
  showUserMenu = false,
  onNavigate,
}: {
  schoolName: string;
  portalLabel: string;
  homeHref: string;
  groups: ShellNavGroup[];
  user: SessionUser;
  onLogout: () => void;
  collapsed?: boolean;
  presentation?: 'docked' | 'overlay';
  showUserMenu?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isOverlay = presentation === 'overlay';
  const showLabels = isOverlay || !collapsed;

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground',
        isOverlay
          ? 'w-full border-0'
          : cn(
              'sticky top-0 z-20 flex shrink-0 transition-[width] duration-200',
              collapsed ? 'w-[72px]' : 'w-[280px]',
            ),
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-3 border-b border-border/70 md:h-20',
          showLabels ? 'px-5' : 'justify-center px-2',
        )}
      >
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        >
          <Landmark className="size-5" />
        </div>
        {showLabels ? (
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold tracking-tight text-foreground">
              {schoolName}
            </p>
            <p className="truncate font-mono text-xs font-semibold text-muted-foreground">
              {portalLabel}
            </p>
          </div>
        ) : null}
      </div>

      <nav
        aria-label={portalLabel}
        className={cn(
          'mt-4 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4',
          showLabels ? 'px-3' : 'px-2',
        )}
      >
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {showLabels ? (
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">
                {group.label}
              </p>
            ) : (
              <span className="sr-only">{group.label}</span>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActiveShellPath(pathname, item.href, homeHref);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!showLabels ? item.label : undefined}
                  aria-label={!showLabels ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg text-sm font-semibold transition-colors',
                    showLabels ? 'gap-3 px-3 py-2.5' : 'justify-center px-1 py-2.5',
                    active
                      ? 'bg-academic text-academic-foreground shadow-[0_1px_3px_0_rgba(15,30,54,0.04)]'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {showLabels ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
