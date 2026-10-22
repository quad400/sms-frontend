'use client';

import Link from 'next/link';
import { usePortalAnnouncements, usePortalEvents, usePortalOverview } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { useSession } from '@/lib/auth/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentHome() {
  const { user } = useSession();
  const overview = usePortalOverview();
  const announcements = usePortalAnnouncements();
  const events = usePortalEvents();

  const data = asRecord(overview.data);
  const child = asRecord(data?.child);
  const enrolment = asRecord(data?.enrolment);
  const attendanceRecent = asArray(data?.attendanceRecent);
  const presentCount = attendanceRecent.filter((row) => {
    const r = asRecord(row);
    const code = str(r?.statusCode ?? r?.status ?? r?.mark);
    return code === 'present' || code === 'Present';
  }).length;
  const rate =
    attendanceRecent.length > 0
      ? Math.round((presentCount / attendanceRecent.length) * 100)
      : null;

  const classLabel = child
    ? [str(child.firstName), str(child.lastName)].filter(Boolean).join(' ')
    : user?.displayName ?? 'Student';
  const classId = num(child?.classId ?? enrolment?.classId, 0);

  const announcementList = asArray(announcements.data ?? data?.announcements);
  const eventList = asArray(events.data).slice(0, 3);
  const latestAnnouncement = asRecord(announcementList[0]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hi, {classLabel.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">
          {classId ? `Class ${classId}` : 'Your day at a glance'}
        </p>
      </div>

      <QueryState isPending={overview.isPending} error={overview.error}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next lesson</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Check your timetable for today’s periods.
            <div className="mt-3">
              <Link href="/student/timetable" className="font-medium text-brand hover:underline">
                Open timetable
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {rate === null ? '—' : `${rate}%`}
              </p>
              <p className="text-xs text-muted-foreground">Recent marks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest news</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {latestAnnouncement ? (
                <p className="line-clamp-3">{str(latestAnnouncement.title, 'Announcement')}</p>
              ) : (
                <p className="text-muted-foreground">No announcements yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent>
            {eventList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {eventList.map((item, index) => {
                  const event = asRecord(item);
                  return (
                    <li key={str(event?.id, String(index))} className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="font-medium">{str(event?.title, 'Event')}</p>
                      <p className="text-xs text-muted-foreground">
                        {str(event?.startsAt ?? event?.startAt ?? event?.date)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/student/events"
              className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
            >
              All events
            </Link>
          </CardContent>
        </Card>
      </QueryState>
    </div>
  );
}
