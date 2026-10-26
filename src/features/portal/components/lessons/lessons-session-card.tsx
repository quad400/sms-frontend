'use client';

import { ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  formatSessionClock,
  isLive,
  opensAtLabel,
  relativeSessionBadge,
  type LiveSession,
} from './parse-live-sessions';

export function LessonsSessionCard({
  session,
  nowMs,
}: {
  session: LiveSession;
  nowMs: number;
}) {
  const live = isLive(session, nowMs);
  const badge = relativeSessionBadge(session, nowMs);

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-stretch sm:gap-5',
        live ? 'border-academic ring-1 ring-academic/30' : 'border-border',
      )}
    >
      <div
        className={cn(
          'flex shrink-0 flex-col items-start justify-center gap-1 border-b border-border pb-3 sm:w-[7.5rem] sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5',
          live && 'border-academic/20',
        )}
      >
        <p className="font-mono text-lg font-semibold tabular-nums leading-none">
          {formatSessionClock(session.startMs)}
        </p>
        <span
          className={cn(
            'mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
            live
              ? 'bg-academic text-academic-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {live ? (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-academic-foreground opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-academic-foreground" />
            </span>
          ) : null}
          {badge}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {session.subjectName ? (
            <span className="font-mono font-semibold uppercase tracking-wider text-foreground/80">
              {session.subjectName}
            </span>
          ) : null}
          {session.teacherName ? <span>{session.teacherName}</span> : null}
          {session.meetUrl ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium text-foreground/80">
              <Video className="size-3" aria-hidden />
              Meet
            </span>
          ) : null}
        </div>
        <h3 className="font-heading text-base font-semibold leading-snug md:text-lg">
          {session.title}
        </h3>
      </div>

      <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 sm:items-end">
        {live && session.meetUrl ? (
          <Button asChild className="bg-academic text-academic-foreground hover:bg-academic/90">
            <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
              Join Live
            </a>
          </Button>
        ) : session.meetUrl && session.startMs <= nowMs + 15 * 60_000 ? (
          <Button asChild variant="outline">
            <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
              Open link
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">{opensAtLabel(session.startMs)}</p>
        )}
      </div>
    </article>
  );
}
