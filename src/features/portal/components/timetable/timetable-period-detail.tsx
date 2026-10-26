'use client';

import { CalendarOff, Clock, DoorOpen, MessageCircleQuestion, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils/cn';
import { DAY_LONG, timeRange, type TimetableSlot } from '../../lib/schedule';

export function TimetablePeriodDetail({
  slot,
  onRequestAbsence,
  onAskTeacher,
}: {
  slot: TimetableSlot;
  onRequestAbsence: () => void;
  onAskTeacher: () => void;
}) {
  const rows: { icon: typeof Clock; label: string; value: string; mono?: boolean }[] = [
    { icon: Clock, label: 'Time', value: `${DAY_LONG[slot.day]}, ${timeRange(slot)}`, mono: true },
    { icon: UserRound, label: 'Teacher', value: slot.teacherName || 'To be confirmed' },
    { icon: DoorOpen, label: 'Room', value: slot.roomName || 'To be confirmed' },
  ];

  return (
    <>
      <SheetHeader>
        {slot.periodLabel ? (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-academic">
            {slot.periodLabel}
          </p>
        ) : null}
        <SheetTitle className="font-heading text-2xl">{slot.subjectName}</SheetTitle>
        <SheetDescription>Lesson details</SheetDescription>
      </SheetHeader>
      <dl className="space-y-3">
        {rows.map(({ icon: Icon, label, value, mono }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-academic/10 text-academic">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className={cn('font-medium', mono && 'font-mono tabular-nums')}>{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" onClick={onRequestAbsence}>
          <CalendarOff aria-hidden />
          Request absence
        </Button>
        <Button type="button" variant="outline" onClick={onAskTeacher}>
          <MessageCircleQuestion aria-hidden />
          Ask teacher
        </Button>
      </div>
    </>
  );
}
