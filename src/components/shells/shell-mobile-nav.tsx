'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  isActiveShellPath,
  type ShellNavItem,
} from '@/components/shells/shell-nav';
import { cn } from '@/lib/utils/cn';

export function ShellMobileNav({
  homeHref,
  tabs,
  moreItems,
  maxTabs = 3,
}: {
  homeHref: string;
  tabs: ShellNavItem[];
  moreItems: ShellNavItem[];
  maxTabs?: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const visibleTabs = tabs.slice(0, maxTabs);
  const moreActive = moreItems.some((item) => isActiveShellPath(pathname, item.href, homeHref));
  const cols = Math.min(visibleTabs.length + 1, 5);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul
          className="mx-auto grid max-w-lg gap-1 px-2 py-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {visibleTabs.map((item) => {
            const Icon = item.icon;
            const active = isActiveShellPath(pathname, item.href, homeHref);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors',
                    active
                      ? 'bg-academic text-academic-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{item.tabLabel ?? item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                'flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-semibold transition-colors',
                moreActive || moreOpen
                  ? 'bg-academic text-academic-foreground'
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
              const active = isActiveShellPath(pathname, item.href, homeHref);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-academic text-academic-foreground'
                        : 'text-foreground hover:bg-muted',
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
    </>
  );
}
