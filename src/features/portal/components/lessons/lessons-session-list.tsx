'use client';

import { EmptyState } from '@/components/patterns/empty-state';
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
      <EmptyState
        icon={Video}
        title={emptyTitle}
        description={emptyBody}
        className="bg-card"
      />
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
