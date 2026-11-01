'use client';

import { Loader } from '@/components/patterns/loader';
import { Suspense, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Building2, CalendarDays, Plus } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate, useSession } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { useSessions } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { CampusesPanel } from './campuses-page';
import { SessionsPanel } from './sessions-page';

export type StructureTab = 'campuses' | 'sessions';

const TABS: Array<{
  id: StructureTab;
  label: string;
  description: string;
  permission?: string;
  icon: typeof Building2;
}> = [
  {
    id: 'campuses',
    label: 'Campuses',
    description: 'Sites & locations',
    permission: 'school-structure.campus.list',
    icon: Building2,
  },
  {
    id: 'sessions',
    label: 'Sessions & terms',
    description: 'Calendar & holidays',
    permission: 'school-structure.session.list',
    icon: CalendarDays,
  },
];

function parseTab(value: string | null): StructureTab {
  return value === 'sessions' ? 'sessions' : 'campuses';
}

function SchoolStructureInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = useSession();
  const { campusQuery } = useAdminCampus();
  const sessions = useSessions(campusQuery);
  const activeSession = (sessions.data ?? []).find((s) => s.isActive);

  const tab = parseTab(searchParams.get('tab'));

  const visibleTabs = TABS.filter((t) => !t.permission || can(t.permission));
  const effectiveTab: StructureTab =
    visibleTabs.some((t) => t.id === tab)
      ? tab
      : (visibleTabs[0]?.id ?? 'campuses');

  const setTab = useCallback(
    (next: StructureTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'campuses') params.delete('tab');
      else params.set('tab', next);
      params.delete('create');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="School Structure"
        titleAddon={
          activeSession ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
              {activeSession.name}
            </span>
          ) : (
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sites & calendar
            </span>
          )
        }
        description="Campuses, academic sessions, and term calendars — the foundation for classes and people."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {effectiveTab === 'campuses' ? (
              <PermissionGate permission="school-structure.campus.create">
                <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                  <Link href="/admin/campuses/new">
                    <Plus className="size-4" />
                    Add campus
                  </Link>
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permission="school-structure.session.create">
                {campusQuery ? (
                  <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                    <Link href="/admin/sessions/new">
                      <Plus className="size-4" />
                      Add session
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-teal-700 hover:bg-teal-800"
                    disabled
                  >
                    <Plus className="size-4" />
                    Add session
                  </Button>
                )}
              </PermissionGate>
            )}
          </div>
        }
      />

      <nav
        className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]"
        aria-label="Structure sections"
      >
        {visibleTabs.map((t) => {
          const active = t.id === effectiveTab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition sm:flex-none',
                active
                  ? 'bg-teal-700 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{t.label}</span>
                <span
                  className={cn(
                    'hidden truncate text-[11px] sm:block',
                    active ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {t.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {effectiveTab === 'campuses' ? <CampusesPanel /> : <SessionsPanel />}
    </div>
  );
}

export function SchoolStructurePage() {
  return (
    <Suspense fallback={<Loader />}>
      <SchoolStructureInner />
    </Suspense>
  );
}
