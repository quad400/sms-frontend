'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';
import { AbsenceRequestDialog, AskTeacherDialog } from './timetable-request-dialogs';
import { usePortalTimetable } from '../hooks/use-portal-timetable';
import { QueryState } from './query-state';
import { asRecord, str } from '@/lib/utils/record';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { formatDateTime } from '../lib/format';
import {
  DAY_LONG,
  dayCodeOf,
  isCurrentSlot,
  parseTimetable,
  useNow,
  type DayCode,
  type TimetableSlot,
} from '../lib/schedule';
import { TimetableAbsencePanel } from './timetable/timetable-absence-panel';
import { TimetableCalmState } from './timetable/timetable-calm-state';
import { TimetableConsultationPanel } from './timetable/timetable-consultation-panel';
import { TimetableDaily } from './timetable/timetable-daily';
import { TimetableHeader, type TimetableView } from './timetable/timetable-header';
import { TimetableLegend } from './timetable/timetable-legend';
import { TimetablePeriodDetail } from './timetable/timetable-period-detail';
import { TimetableWeekMatrix } from './timetable/timetable-week-matrix';

export const TIMETABLE_CACHE_KEY = 'sms.student.timetable.cache';

type CachedTimetable = { savedAt: string; data: unknown };

function writeCache(data: unknown): void {
  try {
    const payload: CachedTimetable = { savedAt: new Date().toISOString(), data };
    window.localStorage.setItem(TIMETABLE_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be full or unavailable (private mode) – caching is best effort.
  }
}

function readCache(): CachedTimetable | null {
  try {
    const raw = window.localStorage.getItem(TIMETABLE_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const record = asRecord(parsed);
    if (!record || !('data' in record)) return null;
    return { savedAt: str(record.savedAt), data: record.data };
  } catch {
    return null;
  }
}

function subscribeOnline(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnline(): boolean {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  return error instanceof Error && /failed to fetch|network|load failed/i.test(error.message);
}

export function StudentTimetable() {
  const query = usePortalTimetable();
  const online = useOnline();
  const now = useNow();
  const [view, setView] = useState<TimetableView>('daily');
  const [picked, setPicked] = useState<DayCode | null>(null);
  const [selected, setSelected] = useState<TimetableSlot | null>(null);
  const [requestDialog, setRequestDialog] = useState<'absence' | 'ask' | null>(null);

  useEffect(() => {
    if (query.isSuccess) writeCache(query.data);
  }, [query.isSuccess, query.data]);

  const needsFallback = !query.data && (!online || (!!query.error && isNetworkError(query.error)));
  const cached = useMemo(() => (needsFallback ? readCache() : null), [needsFallback]);

  const payload = query.data ?? cached?.data;
  const slots = useMemo(() => parseTimetable(payload), [payload]);

  const today = dayCodeOf(now);
  const activeDay = picked ?? today;

  const byDay = useMemo(() => {
    const map: Record<DayCode, TimetableSlot[]> = { mon: [], tue: [], wed: [], thu: [], fri: [] };
    for (const slot of slots) map[slot.day].push(slot);
    return map;
  }, [slots]);

  const liveSlot = useMemo(
    () => slots.find((slot) => isCurrentSlot(slot, now)) ?? null,
    [slots, now],
  );
  const panelContext = selected ?? liveSlot;

  return (
    <div className="space-y-6">
      <TimetableHeader
        view={view}
        onViewChange={setView}
        activeDay={activeDay}
        today={today}
        onDayChange={setPicked}
      />

      {cached ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        >
          <WifiOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-muted-foreground">
            You&rsquo;re offline. Showing the timetable saved
            {cached.savedAt ? ` on ${formatDateTime(cached.savedAt)}` : ' on this device'}.
          </p>
        </div>
      ) : null}

      <QueryState
        isPending={query.isPending && !cached}
        error={cached ? null : query.error}
        onRetry={() => void query.refetch()}
      >
        <div className="space-y-6">
          {view === 'daily' ? (
            activeDay === null ? (
              <TimetableCalmState
                title="No lessons today"
                body="It’s the weekend. Enjoy the rest — pick a day above to preview your week."
              />
            ) : (
              <TimetableDaily
                slots={byDay[activeDay]}
                now={now}
                emptyTitle={`No lessons on ${DAY_LONG[activeDay]}`}
                emptyBody="Nothing is scheduled for this day."
                onSelect={setSelected}
              />
            )
          ) : (
            <TimetableWeekMatrix
              byDay={byDay}
              slots={slots}
              now={now}
              today={today}
              onSelect={setSelected}
            />
          )}

          <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <TimetableAbsencePanel contextSlot={panelContext} />
            <TimetableConsultationPanel contextSlot={panelContext} />
          </div>

          <TimetableLegend />
        </div>
      </QueryState>

      <Sheet open={selected !== null} onOpenChange={(open) => (open ? undefined : setSelected(null))}>
        <SheetContent side="right">
          {selected ? (
            <TimetablePeriodDetail
              slot={selected}
              onRequestAbsence={() => setRequestDialog('absence')}
              onAskTeacher={() => setRequestDialog('ask')}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <AbsenceRequestDialog
        slot={selected}
        open={requestDialog === 'absence'}
        onOpenChange={(open) => setRequestDialog(open ? 'absence' : null)}
      />
      <AskTeacherDialog
        slot={selected}
        open={requestDialog === 'ask'}
        onOpenChange={(open) => setRequestDialog(open ? 'ask' : null)}
      />
    </div>
  );
}
