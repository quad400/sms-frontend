'use client';

import { Clock, MapPin, UserRound, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TIMETABLES_UI_MOCK } from './ui-mock';

export function LivePeriodBar() {
  const live = TIMETABLES_UI_MOCK.live;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-card p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="successSoft" size="sm" className="uppercase tracking-wide">
            Live now
          </Badge>
          <p className="text-sm font-semibold text-foreground">
            {live.period} Ongoing · {live.subject}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {live.className}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserRound className="size-3.5" />
            {live.faculty}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {live.room}
          </span>
          <span>{live.present} present</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="mr-2 text-right text-xs">
          <p className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Clock className="size-3.5" />
            {live.timeRange}
          </p>
          <p className="text-muted-foreground">{live.remaining}</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled>
          Log Period Note
        </Button>
        <Button type="button" size="sm" className="bg-teal-700 hover:bg-teal-800" disabled>
          Roll Call View
        </Button>
      </div>
    </div>
  );
}
