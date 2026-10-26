'use client';

import { useRef } from 'react';
import { CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Cell } from '../../hooks/use-score-editor';

export type ScoreRowModel = { studentId: number; name: string; number: string };

export function ScoreGrid({
  rows,
  maxScore,
  cellOf,
  onText,
  onAbsent,
}: {
  rows: ScoreRowModel[];
  maxScore: number;
  cellOf: (studentId: number) => Cell;
  onText: (studentId: number, text: string) => void;
  onAbsent: (studentId: number, absent: boolean) => void;
}) {
  const inputs = useRef(new Map<number, HTMLInputElement>());

  function move(fromIndex: number, delta: 1 | -1) {
    const target = rows[fromIndex + delta];
    if (!target) return;
    const input = inputs.current.get(target.studentId);
    input?.focus();
    input?.select();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="sticky left-0 z-10 bg-muted px-3 py-2.5">
              Student
            </th>
            <th scope="col" className="px-3 py-2.5">
              Score <span className="font-mono normal-case">/ {maxScore}</span>
            </th>
            <th scope="col" className="px-3 py-2.5">
              Absent
            </th>
            <th scope="col" className="px-3 py-2.5">
              <span className="sr-only">Status</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const cell = cellOf(row.studentId);
            const errorId = `score-error-${row.studentId}`;
            return (
              <tr key={row.studentId} className="border-b border-border/70 last:border-b-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium"
                >
                  <span className="block">{row.name}</span>
                  {row.number ? (
                    <span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">
                      {row.number}
                    </span>
                  ) : null}
                </th>
                <td className="px-3 py-2">
                  <input
                    ref={(node) => {
                      if (node) inputs.current.set(row.studentId, node);
                      else inputs.current.delete(row.studentId);
                    }}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={cell.absent ? '' : cell.text}
                    placeholder={cell.absent ? 'Absent' : '—'}
                    disabled={cell.absent || cell.locked}
                    aria-label={`Score for ${row.name}`}
                    aria-invalid={cell.error ? true : undefined}
                    aria-describedby={cell.error ? errorId : undefined}
                    onChange={(event) => onText(row.studentId, event.target.value)}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        move(index, 1);
                      } else if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        move(index, -1);
                      }
                    }}
                    className={cn(
                      'h-10 w-28 rounded-sm border bg-card px-3 text-right font-mono text-sm tabular-nums shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-muted/60',
                      cell.error
                        ? 'border-danger text-danger focus-visible:ring-danger'
                        : 'border-border focus-visible:ring-ring',
                    )}
                  />
                  {cell.error ? (
                    <p id={errorId} className="mt-1 text-xs text-danger">
                      {cell.error}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={cell.absent}
                    disabled={cell.locked}
                    aria-label={`${row.name} absent`}
                    onChange={(event) => onAbsent(row.studentId, event.target.checked)}
                    className="size-5 rounded border-border accent-[var(--academic)]"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  {cell.onDevice ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      <CloudOff className="size-3" aria-hidden />
                      Saved on device
                    </span>
                  ) : cell.edited ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Unsaved
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
