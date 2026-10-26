'use client';

import { PageHeader } from '@/components/patterns/page-header';

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" description="Unread counts arrive when the backend gap is closed." />
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
    </div>
  );
}
