'use client';

import { Video } from 'lucide-react';
import { LessonsSessionCard } from './lessons-session-card';
import type { LiveSession } from './parse-live-sessions';

export function LessonsSessionList({
  sessions,
  nowMs,
  emptyTitle = 'No sessions in this view',
  emptyBody = 'Try another filter, or check back when a teacher schedules a live class.',
}: {
  sessions: LiveSession[];
  nowMs: number;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-academic/10 text-academic">
          <Video className="size-5" aria-hidden />
        </span>
        <p className="font-heading text-lg font-semibold">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => (
        <li key={session.key}>
          <LessonsSessionCard session={session} nowMs={nowMs} />
        </li>
      ))}
    </ul>
  );
}
