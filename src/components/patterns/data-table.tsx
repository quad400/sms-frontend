'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  density = 'comfortable',
  empty,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  density?: 'compact' | 'comfortable';
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
}) {
  if (rows.length === 0) {
    return (
      empty ?? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No rows to show.
        </p>
      )
    );
  }

  const pad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="sticky top-0 border-b border-border bg-muted">
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  pad,
                  'text-xs font-semibold tracking-normal text-muted-foreground',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-border/70 last:border-b-0',
                onRowClick ? 'cursor-pointer hover:bg-muted/40' : null,
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.id} className={cn(pad, 'align-middle', col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
