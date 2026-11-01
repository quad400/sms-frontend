'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { PageHeader } from '@/components/patterns/page-header';

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" description="Unread counts arrive when the backend gap is closed." />
      <EmptyState title="No notifications yet" description="" />
    </div>
  );
}
