'use client';

import { Clock, ExternalLink, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  formatSessionTime,
  isLive,
  type LiveSession,
} from './parse-live-sessions';

export function LessonsHero({
  session,
  nowMs,
}: {
  session: LiveSession | null;
  nowMs: number;
}) {
  if (!session) {
    return (
      <section
        aria-label="Featured session"
        className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center shadow-[var(--shadow-card)]"
      >
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-academic/10 text-academic">
          <Video className="size-5" aria-hidden />
        </span>
        <p className="font-heading text-lg font-semibold">No live session right now</p>
        <p className="mt-1 text-sm text-muted-foreground">
          When a teacher schedules a class, it will appear here with a join link.
        </p>
      </section>
    );
  }

  const live = isLive(session, nowMs);

  return (
    <section
      aria-label={live ? 'Happening now' : 'Next session'}
      className={cn(
        'overflow-hidden rounded-2xl border border-academic/30 bg-gradient-to-br from-academic to-academic/85 p-6 text-academic-foreground shadow-[var(--shadow-card)] md:p-8',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-academic-foreground/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider">
          {live ? (
            <>
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-academic-foreground opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-academic-foreground" />
              </span>
              Happening now
            </>
          ) : (
            'Up next'
          )}
        </span>
        {session.meetUrl ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-academic-foreground/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider">
            <Video className="size-3" aria-hidden />
            Meet link
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-2">
        {session.subjectName ? (
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-academic-foreground/75">
            {session.subjectName}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-[28px]">
          {session.title}
        </h2>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-academic-foreground/85">
        {session.teacherName ? (
          <p className="inline-flex items-center gap-1.5">
            <User className="size-3.5 shrink-0 opacity-80" aria-hidden />
            {session.teacherName}
          </p>
        ) : null}
        <p className="inline-flex items-center gap-1.5 font-mono tabular-nums">
          <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
          {formatSessionTime(session.startMs)} – {formatSessionTime(session.endMs)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {session.meetUrl ? (
          <Button
            asChild
            className="bg-academic-foreground text-academic hover:bg-academic-foreground/90"
          >
            <a href={session.meetUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
              {live ? 'Launch Meet' : 'Open Meet link'}
            </a>
          </Button>
        ) : (
          <p className="text-sm text-academic-foreground/80">Join link not available yet.</p>
        )}
      </div>
    </section>
  );
}
