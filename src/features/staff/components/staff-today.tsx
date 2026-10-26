'use client';

import Link from 'next/link';
import { CloudOff } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { useSession } from '@/lib/auth/permissions';
import { useApprovalCounts } from '../hooks/use-approvals';
import { useNow } from '../hooks/use-now';
import { useOutboxPending, useRefetchOnOutboxFlush } from '../hooks/use-outbox-pending';
import { useStaffMe, useStaffOverview } from '../hooks/use-staff-me';
import { formatLongDate, greetingFor, nowInZone, plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import { AnnouncementCard } from './shared/announcement-card';
import { EmptyPanel, Panel } from './shared/panel';
import { TodayLessons } from './today/today-lessons';
import { TodayTodo } from './today/today-todo';

export function StaffToday() {
  const overview = useStaffOverview();
  const me = useStaffMe();
  const { can } = useSession();
  const now = useNow();
  const { counts, canApprove } = useApprovalCounts();
  const pending = useOutboxPending();
  useRefetchOnOutboxFlush();

  const data = overview.data;
  const clock = now ? nowInZone(data?.timezone, now) : null;
  const firstName = me.data?.firstName;
  const greeting = clock ? greetingFor(clock.minutes) : 'Welcome';

  return (
    <div className="space-y-5">
      <PageHeader
        title={firstName ? `${greeting}, ${firstName}` : greeting}
        description={data ? formatLongDate(data.date) : 'Your lessons, registers and scores.'}
      />

      <QueryState
        isPending={overview.isPending}
        error={overview.error}
        onRetry={() => void overview.refetch()}
      >
        {data ? (
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-5">
              <TodayLessons
                overview={data}
                nowMinutes={clock?.minutes ?? null}
                canOpenRegister={can('attendance.register.open')}
              />
            </div>
            <div className="min-w-0 space-y-5">
              <TodayTodo overview={data} approvals={canApprove ? counts : null} />

              <Panel
                title="Latest announcements"
                actions={
                  can('communication.announcement.list') ? (
                    <Link
                      href="/staff/announcements"
                      className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                    >
                      View all
                    </Link>
                  ) : null
                }
              >
                {data.announcements.length === 0 ? (
                  <EmptyPanel
                    title="No announcements"
                    description="School announcements will appear here."
                  />
                ) : (
                  <div className="space-y-2">
                    {data.announcements.map((announcement) => (
                      <AnnouncementCard key={announcement.id} announcement={announcement} compact />
                    ))}
                  </div>
                )}
              </Panel>

              {pending.length > 0 ? (
                <Panel>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800">
                      <CloudOff className="size-4" aria-hidden />
                    </span>
                    <div className="text-sm">
                      <p className="font-medium">
                        {plural(pending.length, 'change')} waiting to sync
                      </p>
                      <p className="text-muted-foreground">
                        Saved on this device. They upload automatically when you’re back online.
                      </p>
                    </div>
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>
        ) : null}
      </QueryState>
    </div>
  );
}
