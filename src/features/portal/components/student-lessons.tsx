'use client';

import { useMemo, useState } from 'react';
import { usePortalLessonNotes } from '../hooks/use-portal-lesson-notes';
import { usePortalLiveSessions } from '../hooks/use-portal-live-sessions';
import { QueryState } from './query-state';
import { useFeatureFlags } from '@/lib/config/use-feature-flags';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';
import { listFrom } from '../lib/format';
import { useNow } from '../lib/schedule';
import { LessonsHeader, type LessonsFilter } from './lessons/lessons-header';
import { LessonsHero } from './lessons/lessons-hero';
import { LessonsNotesList } from './lessons/lessons-notes-list';
import { LessonsNotesRail } from './lessons/lessons-notes-rail';
import { LessonsSessionList } from './lessons/lessons-session-list';
import {
  isLive,
  isSameLocalDay,
  parseSessions,
  weekBoundsMs,
  type LiveSession,
} from './lessons/parse-live-sessions';

function filterSessions(
  sessions: LiveSession[],
  filter: LessonsFilter,
  now: Date,
): LiveSession[] {
  if (filter === 'notes') return [];
  const nowMs = now.getTime();
  if (filter === 'today') {
    return sessions.filter((s) => isSameLocalDay(s.startMs, nowMs));
  }
  if (filter === 'week') {
    const { startMs, endMs } = weekBoundsMs(now);
    return sessions.filter((s) => s.startMs >= startMs && s.startMs < endMs);
  }
  return sessions;
}

export function StudentLessons() {
  const flags = useFeatureFlags();
  const lmsEnabled = flags.isEnabled(STUDENT_MODULE_FLAGS.lms);
  const live = usePortalLiveSessions({ enabled: lmsEnabled });
  const notesQuery = usePortalLessonNotes();
  const now = useNow(15_000);
  const nowMs = now.getTime();

  const [filter, setFilter] = useState<LessonsFilter>('all');
  const activeFilter: LessonsFilter = lmsEnabled ? filter : 'notes';

  const sessions = useMemo(() => parseSessions(live.data), [live.data]);
  const notes = useMemo(() => listFrom(notesQuery.data, 'items', 'notes'), [notesQuery.data]);

  const featured = useMemo(() => {
    const liveNow = sessions.find((s) => isLive(s, nowMs));
    if (liveNow) return liveNow;
    return sessions.find((s) => s.startMs > nowMs) ?? sessions[0] ?? null;
  }, [sessions, nowMs]);

  const todayCount = useMemo(
    () => sessions.filter((s) => isSameLocalDay(s.startMs, nowMs)).length,
    [sessions, nowMs],
  );
  const weekCount = useMemo(() => {
    const { startMs, endMs } = weekBoundsMs(now);
    return sessions.filter((s) => s.startMs >= startMs && s.startMs < endMs).length;
  }, [sessions, now]);

  const filtered = useMemo(
    () => filterSessions(sessions, activeFilter, now),
    [sessions, activeFilter, now],
  );

  const filterOptions = useMemo(() => {
    if (!lmsEnabled) {
      return [{ value: 'notes' as const, label: `Notes (${notes.length})` }];
    }
    return [
      { value: 'all' as const, label: `All (${sessions.length})` },
      { value: 'today' as const, label: `Today (${todayCount})` },
      { value: 'week' as const, label: `This week (${weekCount})` },
      { value: 'notes' as const, label: `Notes (${notes.length})` },
    ];
  }, [lmsEnabled, sessions.length, todayCount, weekCount, notes.length]);

  const showNotes = activeFilter === 'notes';

  return (
    <div className="space-y-6 md:space-y-8">
      <LessonsHeader
        filter={activeFilter}
        onFilterChange={setFilter}
        options={filterOptions}
        showFilters={lmsEnabled}
      />

      {lmsEnabled && !showNotes ? (
        <QueryState
          isPending={live.isPending}
          error={live.error}
          onRetry={() => void live.refetch()}
        >
          <div className="space-y-6">
            <LessonsHero session={featured} nowMs={nowMs} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
              <LessonsSessionList
                sessions={filtered}
                nowMs={nowMs}
                emptyTitle={
                  activeFilter === 'today'
                    ? 'No sessions today'
                    : activeFilter === 'week'
                      ? 'No sessions this week'
                      : 'No live sessions scheduled'
                }
                emptyBody={
                  activeFilter === 'all'
                    ? 'When a teacher schedules a live class for your class, it will appear here.'
                    : 'Try All sessions, or check back later.'
                }
              />
              <div className="lg:sticky lg:top-6">
                <QueryState
                  isPending={notesQuery.isPending}
                  error={notesQuery.error}
                  onRetry={() => void notesQuery.refetch()}
                >
                  <LessonsNotesRail notes={notes} onViewAll={() => setFilter('notes')} />
                </QueryState>
              </div>
            </div>
          </div>
        </QueryState>
      ) : (
        <section aria-labelledby="lesson-notes-heading" className="space-y-3">
          <h2 id="lesson-notes-heading" className="font-heading text-lg font-semibold">
            Lesson notes
          </h2>
          <QueryState
            isPending={notesQuery.isPending}
            error={notesQuery.error}
            isEmpty={notes.length === 0}
            onRetry={() => void notesQuery.refetch()}
            empty={<LessonsNotesList notes={[]} />}
          >
            <LessonsNotesList notes={notes} />
          </QueryState>
        </section>
      )}
    </div>
  );
}
