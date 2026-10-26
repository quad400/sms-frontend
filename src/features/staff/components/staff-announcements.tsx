'use client';

import { useMemo } from 'react';
import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { useAnnouncements } from '../hooks/use-communication';
import { QueryState } from '../lib/shared';
import { AnnouncementCard } from './shared/announcement-card';
import { EmptyPanel } from './shared/panel';

export function StaffAnnouncements() {
  const announcements = useAnnouncements();
  const rows = useMemo(
    () =>
      [...(announcements.data ?? [])].sort((a, b) =>
        (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt),
      ),
    [announcements.data],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Announcements" description="Notices published by the school." />
      <QueryState
        isPending={announcements.isPending}
        error={announcements.error}
        onRetry={() => void announcements.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={Megaphone}
            title="No announcements"
            description="School announcements will appear here once they’re published."
          />
        }
      >
        <div className="grid gap-2.5">
          {rows.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
