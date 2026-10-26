import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '../../lib/format';
import type { AnnouncementRecord } from '../../types';

export function AnnouncementCard({
  announcement,
  compact = false,
}: {
  announcement: AnnouncementRecord;
  compact?: boolean;
}) {
  const when = formatDate(announcement.publishedAt ?? announcement.createdAt);
  return (
    <article className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
        <Megaphone className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="text-sm font-semibold">{announcement.title}</h3>
          {when ? <time className="text-xs text-muted-foreground">{when}</time> : null}
        </div>
        <p
          className={cn(
            'whitespace-pre-wrap text-sm text-muted-foreground',
            compact && 'line-clamp-2',
          )}
        >
          {announcement.body}
        </p>
      </div>
    </article>
  );
}
