'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType, type ReactNode } from 'react';
import { ChevronDown, Home, Server } from 'lucide-react';
import { SidebarUserMenu } from '@/components/shells/sidebar-user-menu';
import type { SessionUser } from '@/lib/auth/types';
import { cn } from '@/lib/utils/cn';

export type SidebarNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  children?: { label: string; href: string; badge?: string }[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export function buildPortalNavGroups(options: {
  home: string;
  showIt: boolean;
}): SidebarNavGroup[] {
  const general: SidebarNavItem[] = [
    { label: 'Home', href: options.home, icon: Home },
  ];

  const groups: SidebarNavGroup[] = [
    { label: 'General', items: general },
  ];

  if (options.showIt) {
    groups.push({
      label: 'Operations',
      items: [{ label: 'IT operations', href: '/it', icon: Server }],
    });
  }

  return groups;
}

function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  if (href !== '/' && pathname.startsWith(`${href}/`)) {
    return true;
  }
  return false;
}

export function AppSidebar({
  title,
  user,
  groups,
  onLogout,
}: {
  title: string;
  user: SessionUser;
  groups: SidebarNavGroup[];
  onLogout: () => void;
}) {
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
          <p className="truncate text-xs text-muted-foreground">School portal</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <SidebarGroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SidebarNavEntry key={item.href} item={item} />
            ))}
          </SidebarGroup>
        ))}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <SidebarUserMenu user={user} onLogout={onLogout} />
      </div>
    </aside>
  );
}

function SidebarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function SidebarNavEntry({ item }: { item: SidebarNavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const childActive = item.children?.some((child) => isActivePath(pathname, child.href)) ?? false;
  const active = isActivePath(pathname, item.href) || childActive;
  const [open, setOpen] = useState(childActive || active);

  if (item.children?.length) {
    return (
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            active
              ? 'bg-brand text-brand-foreground'
              : 'text-sidebar-foreground hover:bg-muted',
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          />
        </button>
        {open ? (
          <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
            {item.children.map((child) => {
              const childIsActive = isActivePath(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    childIsActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span>{child.label}</span>
                  {child.badge ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-soft-foreground">
                      {child.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-brand text-brand-foreground' : 'text-sidebar-foreground hover:bg-muted',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}
