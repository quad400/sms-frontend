'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { TimeSlot, Timetable, TimetableSlot } from '../../api/academics';
import type { Subject } from '../../api/structure';
import { fullName, type StaffRow } from '../../types';
import {
  TIMETABLES_UI_MOCK,
  WEEKDAY_ROWS,
  demoCell,
} from './ui-mock';

export function ScheduleGrid({
  timeSlots,
  timetable,
  subjects,
  staff,
  rooms,
  useDemo,
}: {
  timeSlots: TimeSlot[];
  timetable: Timetable | null;
  subjects: Subject[];
  staff: StaffRow[];
  rooms: Array<{ id: number; name: string }>;
  useDemo: boolean;
}) {
  const slots = [...timeSlots].sort((a, b) => a.ordinal - b.ordinal);
  const cellMap = new Map<string, TimetableSlot>();
  for (const s of timetable?.slots ?? []) {
    cellMap.set(`${s.weekday}-${s.timeSlotId}`, s);
  }

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const staffById = new Map(staff.map((s) => [s.id, s]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));

  const footer = TIMETABLES_UI_MOCK.footer;
  const teachingSlots = slots.filter((s) => !s.isBreak).length;
  const assignedReal = timetable?.slots?.length ?? 0;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="sticky left-0 z-[1] bg-muted/40 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Day
              </th>
              {slots.map((ts) => (
                <th
                  key={ts.id}
                  className={cn(
                    'min-w-[7.5rem] px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                    ts.isBreak && 'bg-muted/60',
                  )}
                >
                  <span className="block">{ts.name}</span>
                  <span className="mt-0.5 block font-normal normal-case tabular-nums text-[10px]">
                    {ts.startTime}–{ts.endTime}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAY_ROWS.map((day, dayIndex) => (
              <tr key={day.id} className="border-b border-border/70 last:border-0">
                <td className="sticky left-0 z-[1] bg-card px-3 py-2 align-middle">
                  <p className="font-semibold text-foreground">{day.label}</p>
                  <p className="text-[10px] text-muted-foreground">{day.day}</p>
                </td>
                {slots.map((ts, slotIndex) => {
                  if (ts.isBreak) {
                    return (
                      <td
                        key={ts.id}
                        className="bg-muted/40 px-1 py-2 text-center align-middle"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Break
                        </span>
                      </td>
                    );
                  }

                  const real = cellMap.get(`${day.id}-${ts.id}`);
                  if (!useDemo && real?.subjectId) {
                    const sub = subjectById.get(real.subjectId);
                    const teacher = staffById.get(real.teacherStaffId);
                    const room = real.roomId != null ? roomById.get(real.roomId) : null;
                    const initials = teacher
                      ? `${teacher.firstName?.[0] ?? ''}${teacher.lastName?.[0] ?? ''}`.toUpperCase()
                      : '—';
                    return (
                      <td key={ts.id} className="p-1.5 align-top">
                        <PeriodCard
                          code={sub?.code ?? `SUB-${real.subjectId}`}
                          name={sub?.name ?? 'Subject'}
                          teacher={initials}
                          room={room?.name ?? '—'}
                          live={false}
                          teacherTitle={
                            teacher
                              ? fullName(teacher.firstName, teacher.lastName, teacher.middleName)
                              : undefined
                          }
                        />
                      </td>
                    );
                  }

                  const demo = demoCell(dayIndex, slotIndex);
                  return (
                    <td key={ts.id} className="p-1.5 align-top">
                      <PeriodCard
                        code={demo.code}
                        name={demo.name}
                        teacher={demo.teacher}
                        room={demo.room}
                        live={demo.live && dayIndex === 0 && slotIndex === 1}
                        muted={useDemo}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>
            Total Assigned Periods:{' '}
            <strong className="text-foreground tabular-nums">
              {useDemo ? footer.assigned : assignedReal} Slots
            </strong>
          </span>
          <span>
            Core STEM Load:{' '}
            <strong className="text-foreground">
              {footer.stem} Slots ({footer.stemPct}%)
            </strong>
          </span>
          <span>
            Electives: <strong className="text-foreground">{footer.electives} Slots</strong>
          </span>
          {!useDemo && teachingSlots > 0 ? (
            <span className="text-muted-foreground">
              {teachingSlots} teaching columns ·{' '}
              {timetable ? (
                <Link
                  href={`/admin/timetables/${timetable.id}`}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Open builder
                </Link>
              ) : null}
            </span>
          ) : null}
        </div>
        <Badge variant="successSoft" size="sm">
          Academic Board Certified
        </Badge>
      </div>
    </div>
  );
}

function PeriodCard({
  code,
  name,
  teacher,
  room,
  live,
  muted,
  teacherTitle,
}: {
  code: string;
  name: string;
  teacher: string;
  room: string;
  live?: boolean;
  muted?: boolean;
  teacherTitle?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-2 py-1.5 shadow-sm',
        live
          ? 'border-emerald-300 bg-emerald-50'
          : muted
            ? 'border-border/80 bg-background'
            : 'border-border bg-background',
      )}
      title={teacherTitle}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="font-mono text-[10px] font-semibold text-teal-800">{code}</p>
        {live ? (
          <Badge variant="successSoft" size="sm" className="px-1 py-0 text-[9px]">
            LIVE
          </Badge>
        ) : (
          <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden />
        )}
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-foreground">
        {name}
      </p>
      <p className="mt-1 flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
        <span className="font-semibold uppercase">{teacher}</span>
        <span className="truncate tabular-nums">{room}</span>
      </p>
    </div>
  );
}
