'use client';

import type { ReactNode } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import type { SchoolClass } from '../../api/structure';

export function AttendanceDateField({
  label,
  id,
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
}: {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        className="w-[11.5rem]"
      />
    </div>
  );
}

export function AttendanceFiltersBar({
  date,
  onDateChange,
  dateLabel = 'Date',
  from,
  to,
  onFromChange,
  onToChange,
  classId,
  onClassIdChange,
  classes,
  actions,
  className,
}: {
  /** Single-day filter (Today / staff mark date). */
  date?: string;
  onDateChange?: (value: string) => void;
  dateLabel?: string;
  /** Range filters (Classes / Students / Staff cumulative). */
  from?: string;
  to?: string;
  onFromChange?: (value: string) => void;
  onToChange?: (value: string) => void;
  classId?: string;
  onClassIdChange?: (value: string) => void;
  classes?: SchoolClass[];
  actions?: ReactNode;
  className?: string;
}) {
  const showRange = from != null && to != null && onFromChange && onToChange;
  const showDay = date != null && onDateChange;
  const showClass = classes != null && onClassIdChange != null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]',
        actions ? 'justify-between' : null,
        className,
      )}
    >
      <div className="flex flex-wrap items-end gap-3">
        {showDay ? (
          <AttendanceDateField
            id="attendance-date"
            label={dateLabel}
            value={date}
            onChange={onDateChange}
          />
        ) : null}

        {showRange ? (
          <>
            <AttendanceDateField
              id="attendance-from"
              label="From"
              value={from}
              onChange={onFromChange}
              placeholder="Start date"
            />
            <AttendanceDateField
              id="attendance-to"
              label="To"
              value={to}
              onChange={onToChange}
              placeholder="End date"
            />
          </>
        ) : null}

        {showClass ? (
          <div className="space-y-1.5">
            <Label className="text-xs">Class</Label>
            <Select
              value={classId || 'all'}
              onValueChange={(v) => onClassIdChange(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="w-[12rem]">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
