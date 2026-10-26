'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Banknote,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Megaphone,
} from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { buttonVariants } from '@/components/ui/button';
import { formatMoneyMinor } from '@/lib/money/format';
import { cn } from '@/lib/utils/cn';
import { childPath } from '@/components/shells/parent-nav';
import { useActiveChild } from '../hooks/use-active-child';
import { useChildOverview } from '../hooks/use-child-data';
import { useAnnouncements } from '../hooks/use-portal-feed';
import { childName, formatDate, localToday, statusLabel } from '../lib/format';
import { QueryState } from '../lib/shared';

function markOf(entry: { status?: string; mark?: string } | undefined): string {
  return (entry?.status ?? entry?.mark ?? '').toLowerCase();
}

export function ParentHome() {
  const { children, activeChild, activeChildId, isPending, error, refetch, selectChild } =
    useActiveChild();
  const overview = useChildOverview(activeChildId);
  const announcements = useAnnouncements();

  const data = overview.data;
  const today = localToday();
  const todayEntry = data?.attendanceRecent?.find((row) => row.date?.slice(0, 10) === today);
  const todayMark = markOf(todayEntry);
  const outstanding =
    data?.balances?.reduce((sum, row) => sum + (row.outstandingMinor > 0 ? row.outstandingMinor : 0), 0) ??
    0;
  const primaryBalance = data?.balances?.find((row) => row.outstandingMinor > 0) ?? data?.balances?.[0];
  const latestResult = data?.latestResults?.find((row) => !row.withheld && row.status !== 'withheld');
  const feesHref = activeChildId ? childPath(activeChildId, '/fees') : '/parent';

  return (
    <div className="space-y-5">
      <PageHeader
        title="Home"
        description="Attendance, results and fees for your children."
      />

      <QueryState
        isPending={isPending || (activeChildId !== null && overview.isPending)}
        error={error ?? overview.error}
        onRetry={() => {
          refetch();
          void overview.refetch();
        }}
      >
        {children.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            No children are linked to this account yet. Contact the school office if this looks wrong.
          </p>
        ) : (
          <>
            {outstanding > 0 && primaryBalance ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">
                  Fees overdue — {formatMoneyMinor(primaryBalance.outstandingMinor, primaryBalance.currency)} owing
                </p>
                <Link href={feesHref} className={buttonVariants({ size: 'sm' })}>
                  Pay now
                </Link>
              </div>
            ) : null}

            <section aria-label="Your children" className="grid gap-2 sm:grid-cols-2">
              {children.map((child) => {
                const selected = child.id === activeChildId;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => selectChild(child.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-[var(--shadow-card)] transition-colors',
                      selected ? 'border-academic bg-accent-soft' : 'border-border hover:bg-muted/50',
                    )}
                  >
                    {child.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={child.photoUrl}
                        alt=""
                        className="size-12 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                        {child.firstName.slice(0, 1)}
                        {child.lastName.slice(0, 1)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{childName(child)}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {child.className ?? (child.classId ? `Class ${child.classId}` : 'No class')}
                      </span>
                    </span>
                  </button>
                );
              })}
            </section>

            {activeChild && data ? (
              <>
                <section
                  aria-label="Today"
                  className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Today · {childName(activeChild)}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {todayMark
                      ? `Attendance: ${statusLabel(todayMark)}`
                      : 'No attendance mark recorded yet today.'}
                  </p>
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Tile
                    href={childPath(activeChild.id, '/attendance')}
                    icon={ClipboardList}
                    label="Attendance"
                    value={
                      data.attendanceRecent?.length
                        ? `${data.attendanceRecent.filter((e) => markOf(e).startsWith('present')).length} present recently`
                        : 'View calendar'
                    }
                  />
                  <Tile
                    href={childPath(activeChild.id, '/results')}
                    icon={GraduationCap}
                    label="Latest result"
                    value={
                      data.resultsWithheld
                        ? 'Withheld — pay fees'
                        : latestResult
                          ? `${latestResult.termName ?? 'Term'}${
                              latestResult.average != null
                                ? ` · avg ${latestResult.average}`
                                : ''
                            }`
                          : 'No results yet'
                    }
                  />
                  <Tile
                    href={childPath(activeChild.id, '/fees')}
                    icon={Banknote}
                    label="Fees balance"
                    value={
                      primaryBalance
                        ? formatMoneyMinor(
                            Math.max(0, primaryBalance.outstandingMinor),
                            primaryBalance.currency,
                          )
                        : 'No balance'
                    }
                    action={
                      outstanding > 0 ? (
                        <span className="text-xs font-semibold text-brand">Pay now</span>
                      ) : null
                    }
                  />
                  <Tile
                    href="/parent/events"
                    icon={CalendarDays}
                    label="School events"
                    value="View calendar"
                  />
                </div>
              </>
            ) : null}

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-base font-semibold">Announcements</h2>
                <Link
                  href="/parent/announcements"
                  className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                >
                  View all
                </Link>
              </div>
              <QueryState isPending={announcements.isPending} error={announcements.error}>
                {(announcements.data ?? data?.announcements ?? []).slice(0, 3).length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    No announcements right now.
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {(announcements.data ?? data?.announcements ?? []).slice(0, 3).map((item) => (
                      <li
                        key={item.id}
                        className="rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)]"
                      >
                        <p className="flex items-start gap-2 text-sm font-medium">
                          <Megaphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="min-w-0 truncate">{item.title}</span>
                        </p>
                        {item.publishedAt ? (
                          <p className="mt-1 pl-6 text-xs text-muted-foreground">
                            {formatDate(item.publishedAt)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </QueryState>
            </section>
          </>
        )}
      </QueryState>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  label,
  value,
  action,
}: {
  href: string;
  icon: typeof ClipboardList;
  label: string;
  value: string;
  action?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-muted/50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {action}
        </span>
        <span className="mt-1 block text-sm font-medium">{value}</span>
      </span>
    </Link>
  );
}
