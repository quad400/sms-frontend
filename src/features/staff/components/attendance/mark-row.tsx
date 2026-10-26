import { CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { AttendanceMark } from '../../types';
import { isMark, MARK_LABEL, MARK_ORDER, MARK_SHORT, MARK_STYLE, nextMark } from './mark-config';

export type RosterRow = { studentId: number; name: string; number: string };

export function MarkRow({
  row,
  mark,
  mode,
  readOnly,
  edited,
  onDevice,
  onChange,
}: {
  row: RosterRow;
  mark: string;
  mode: 'quick' | 'detailed';
  readOnly: boolean;
  edited: boolean;
  onDevice: boolean;
  onChange: (mark: AttendanceMark) => void;
}) {
  const current: AttendanceMark = isMark(mark) ? mark : 'present';

  const identity = (
    <span className="min-w-0 flex-1 text-left">
      <span className="block truncate text-sm font-medium">{row.name}</span>
      <span className="block font-mono text-xs tabular-nums text-muted-foreground">{row.number}</span>
    </span>
  );

  const chips = (
    <>
      {onDevice ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          <CloudOff className="size-3" aria-hidden />
          Saved on device
        </span>
      ) : edited ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          Unsaved
        </span>
      ) : null}
    </>
  );

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 px-3 py-2.5 last:border-b-0">
      {mode === 'quick' && !readOnly ? (
        <button
          type="button"
          onClick={() => onChange(nextMark(current))}
          aria-label={`${row.name}: ${MARK_LABEL[current]}. Tap to change.`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {identity}
          {chips}
          <span
            className={cn(
              'inline-flex h-9 min-w-24 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold',
              MARK_STYLE[current],
            )}
          >
            <span aria-hidden className="font-mono">{MARK_SHORT[current]}</span>
            {MARK_LABEL[current]}
          </span>
        </button>
      ) : (
        <>
          {identity}
          {chips}
          {readOnly ? (
            <span
              className={cn(
                'inline-flex h-9 min-w-24 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold',
                MARK_STYLE[current],
              )}
            >
              <span aria-hidden className="font-mono">{MARK_SHORT[current]}</span>
              {MARK_LABEL[current]}
            </span>
          ) : (
            <div role="radiogroup" aria-label={`Mark for ${row.name}`} className="flex gap-1">
              {MARK_ORDER.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={current === option}
                  onClick={() => onChange(option)}
                  className={cn(
                    'h-9 rounded-lg border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    current === option
                      ? MARK_STYLE[option]
                      : 'border-border bg-card text-muted-foreground hover:bg-muted',
                  )}
                >
                  {MARK_LABEL[option]}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </li>
  );
}
