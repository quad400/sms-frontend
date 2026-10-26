'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  isActiveShellPath,
  type ShellNavGroup,
} from '@/components/shells/shell-nav';
import { cn } from '@/lib/utils/cn';

export function ShellMobileNav({
  homeHref,
  tabs,
  moreGroups,
  maxTabs = 3,
}: {
  homeHref: string;
  tabs: ShellNavGroup['items'];
  moreGroups: ShellNavGroup[];
  maxTabs?: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const visibleTabs = tabs.slice(0, maxTabs);
  const moreItems = moreGroups.flatMap((group) => group.items);
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
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-xs font-semibold transition-colors',
                    active
                      ? 'bg-academic text-academic-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="truncate">{item.tabLabel ?? item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              className={cn(
                'flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-xs font-semibold transition-colors',
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
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:max-w-none">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <nav aria-label="All pages" className="mt-4 space-y-5 pb-6">
            {moreGroups.map((group) => (
              <section key={group.label}>
                <h3 className="px-3 pb-1 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveShellPath(pathname, item.href, homeHref);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                            active
                              ? 'bg-academic text-academic-foreground'
                              : 'text-foreground hover:bg-muted',
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
