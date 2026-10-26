'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Bell, GraduationCap, Landmark, PanelLeft, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatTimezoneChip, initialsFor } from '@/components/shells/shell-nav';
import type { SessionUser } from '@/lib/auth/types';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/button';

export function ShellTopBar({
  user,
  timezone,
  title,
  accountHref,
  academicPeriodLabel,
  notificationCount = 0,
  notificationsHref,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenSearch,
  searchPlaceholder = 'Search…',
  leading,
  trailing,
  onLogout,
  className,
}: {
  user: SessionUser;
  timezone: string;
  /** Mobile title next to brand mark when search is hidden. */
  title?: string;
  accountHref: string;
  academicPeriodLabel?: string | null;
  notificationCount?: number;
  notificationsHref?: string;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  searchPlaceholder?: string;
  /** Extra controls before timezone (e.g. sync chip). */
  leading?: ReactNode;
  /** Extra controls after notifications. */
  trailing?: ReactNode;
  onLogout: () => void;
  className?: string;
}) {
  const timezoneLabel = formatTimezoneChip(timezone);
  const badge =
    notificationCount > 0 ? (notificationCount > 99 ? '99+' : String(notificationCount)) : null;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/80 bg-card/85 px-4 backdrop-blur-xl md:h-20 md:gap-4 md:px-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm md:hidden"
        >
          <Landmark className="size-5" />
        </div>
        {onToggleSidebar ? (
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand side panel' : 'Collapse side panel'}
            aria-pressed={sidebarCollapsed}
            onClick={onToggleSidebar}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground shadow-[0_1px_3px_0_rgba(15,30,54,0.04)] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic md:flex"
          >
            <PanelLeft className="size-4" />
          </button>
        ) : null}

        {onOpenSearch ? (
          <button
            type="button"
            onClick={onOpenSearch}
            className="relative hidden h-11 min-w-0 flex-1 items-center rounded-lg border-0 bg-muted/70 pl-11 pr-4 text-left text-sm text-muted-foreground shadow-[0_1px_3px_0_rgba(15,30,54,0.04)] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic md:flex md:max-w-sm"
          >
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            />
            <span className="truncate">{searchPlaceholder}</span>
            <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        ) : title ? (
          <p className="truncate font-heading text-base font-semibold md:hidden">{title}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {leading}

        {academicPeriodLabel ? (
          <div className="hidden h-10 items-center gap-2 rounded-full bg-muted/70 px-4 shadow-[0_1px_3px_0_rgba(15,30,54,0.04)] lg:flex">
            <GraduationCap className="h-[18px] w-[18px] text-academic" aria-hidden />
            <span className="font-mono text-xs font-semibold text-foreground">
              {academicPeriodLabel}
            </span>
          </div>
        ) : null}

        <div
          className="hidden h-10 items-center gap-2 rounded-full bg-muted/70 px-4 shadow-[0_1px_3px_0_rgba(15,30,54,0.04)] sm:flex"
          title={timezoneLabel}
        >
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {timezoneLabel}
          </span>
        </div>

        {onOpenSearch ? (
          <Button aria-label="Search" onClick={onOpenSearch} variant="outline" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        ) : null}

        {notificationsHref ? (
          <Button variant="outline" size="icon" asChild>
            <Link
              href={notificationsHref}
              aria-label={badge ? `Notifications, ${badge} unread` : 'Notifications'}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {badge ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-academic px-1 font-mono text-xs font-bold text-academic-foreground">
                  {badge}
                </span>
              ) : null}
            </Link>
          </Button>
        ) : (
          <div className="relative">
            <Button
              variant="outline"
              aria-label={badge ? `Notifications, ${badge} unread` : 'Notifications'}
              size="icon"
            >
              <Bell className="h-5 w-5" />
              {badge ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-academic px-1 font-mono text-xs font-bold text-academic-foreground">
                  {badge}
                </span>
              ) : null}
            </Button>
          </div>
        )}

        {trailing}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic"
            >
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initialsFor(user.displayName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user.displayName}</span>
                {user.email ? (
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={accountHref}>Account & Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger focus:bg-danger/10 focus:text-danger"
              onSelect={() => onLogout()}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
