'use client';

import { Megaphone, Shield } from 'lucide-react';
import { SectionCard } from '@/components/patterns/section-card';
import { asRecord, str } from '@/lib/utils/record';
import type { Announcement } from '../../api/communication';
import { relativeTime } from './map';

const actionClass = 'text-[11px] font-semibold uppercase tracking-wide no-underline hover:underline';

function audienceLabel(targets?: Array<Record<string, unknown>>): string | null {
  if (!targets?.length) return null;
  const first = targets[0];
  const type = str(first?.type) || str(first?.audience) || str(first?.code);
  return type ? type.replace(/_/g, ' ') : null;
}

export function AnnouncementsCard({
  live,
  snapshot,
}: {
  live: Announcement[];
  snapshot: unknown[];
}) {
  const fromLive = live.slice(0, 6).map((a) => ({
    id: String(a.id),
    title: a.title,
    body: a.body ?? null,
    status: a.status,
    audience: audienceLabel(a.targets),
    when: relativeTime(a.publishedAt),
  }));

  const fromSnap =
    fromLive.length > 0
      ? []
      : snapshot.slice(0, 6).map((a, i) => {
          const rec = asRecord(a);
          return {
            id: String(i),
            title: str(rec?.title) || 'Announcement',
            body: str(rec?.body) || str(rec?.summary) || null,
            status: str(rec?.status) || null,
            audience: str(rec?.audience) || str(rec?.target) || null,
            when: relativeTime(str(rec?.publishedAt) || str(rec?.createdAt) || null),
          };
        });

  const rows = fromLive.length > 0 ? fromLive : fromSnap;

  return (
    <SectionCard
      title="Latest announcements"
      description="Recent campus dispatches and circulars"
      action={{ label: 'Manage →', href: '/admin/announcements' }}
      actionClassName={actionClass}
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No announcements yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex gap-3 rounded-lg border border-border/70 bg-muted/20 p-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {a.audience?.toLowerCase().includes('guardian') ? (
                  <Shield className="size-4" />
                ) : (
                  <Megaphone className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{a.title}</p>
                  {a.audience || a.status ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {a.audience || a.status}
                    </span>
                  ) : null}
                  {a.when ? (
                    <span className="ml-auto text-[11px] text-muted-foreground">{a.when}</span>
                  ) : null}
                </div>
                {a.body ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
