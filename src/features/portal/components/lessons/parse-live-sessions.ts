import { num, str } from '@/lib/utils/record';
import { listFrom } from '../../lib/format';

export type LiveSession = {
  key: string;
  title: string;
  subjectName: string;
  teacherName: string;
  startMs: number;
  endMs: number;
  meetUrl: string;
};

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

function parseMs(value: unknown): number | null {
  const text = str(value);
  if (!text) return null;
  const ms = Date.parse(text);
  return Number.isNaN(ms) ? null : ms;
}

function safeUrl(value: unknown): string {
  const url = str(value).trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

export function parseSessions(data: unknown): LiveSession[] {
  const sessions: LiveSession[] = [];
  listFrom(data, 'sessions', 'items', 'liveSessions').forEach((row, index) => {
    const startMs = parseMs(row.startsAt ?? row.startAt ?? row.scheduledAt ?? row.startTime);
    if (startMs === null) return;
    const explicitEnd = parseMs(row.endsAt ?? row.endAt ?? row.endTime);
    const duration = num(row.durationMinutes, 0) * 60_000;
    const idValue = row.id;
    sessions.push({
      key: typeof idValue === 'string' || typeof idValue === 'number' ? String(idValue) : `session-${index}`,
      title: str(row.title ?? row.name) || 'Live session',
      subjectName: str(row.subjectName),
      teacherName: str(row.teacherName),
      startMs,
      endMs: explicitEnd ?? startMs + (duration > 0 ? duration : DEFAULT_DURATION_MS),
      meetUrl: safeUrl(row.meetUrl),
    });
  });
  return sessions.sort((a, b) => a.startMs - b.startMs);
}

export function isLive(session: LiveSession, nowMs: number): boolean {
  return session.startMs <= nowMs && nowMs < session.endMs;
}

export function formatSessionTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatSessionClock(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Same local calendar day. */
export function isSameLocalDay(aMs: number, bMs: number): boolean {
  const a = new Date(aMs);
  const b = new Date(bMs);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Monday 00:00 → next Monday 00:00 local. */
export function weekBoundsMs(now: Date): { startMs: number; endMs: number } {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

export function relativeSessionBadge(session: LiveSession, nowMs: number): string {
  if (isLive(session, nowMs)) return 'LIVE';

  const diff = session.startMs - nowMs;
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `In ${Math.max(1, mins)} min`;
  if (mins < 24 * 60) {
    const hrs = Math.round(mins / 60);
    return `In ${hrs} hr${hrs === 1 ? '' : 's'}`;
  }

  const start = new Date(session.startMs);
  const tomorrow = new Date(nowMs);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const dayShort = start.toLocaleDateString('en-GB', { weekday: 'short' });
  if (start >= tomorrow && start < dayAfter) return `Tomorrow (${dayShort})`;
  const dayLong = start.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${dayLong} (${dayShort})`;
}

export function opensAtLabel(startMs: number): string {
  return `Opens ${new Date(startMs).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
