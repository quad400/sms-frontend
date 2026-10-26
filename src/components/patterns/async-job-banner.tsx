'use client';

import { StatusBadge } from '@/components/patterns/status-badge';

export function AsyncJobBanner({
  status,
  message,
  progressLabel,
}: {
  status: string;
  message?: string;
  progressLabel?: string;
}) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
    >
      <StatusBadge status={status} />
      <span className="text-foreground">{message ?? 'Working…'}</span>
      {progressLabel ? <span className="text-muted-foreground">{progressLabel}</span> : null}
    </div>
  );
}
