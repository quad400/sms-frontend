'use client';

import type { CSSProperties, ReactNode } from 'react';
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
  className,
  style,
  minRows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  density?: 'compact' | 'comfortable';
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  style?: CSSProperties;
  /**
   * Reserve vertical space for this many body rows so footers (e.g. pagination)
   * stay put when the current page has fewer rows.
   */
  minRows?: number;
}) {
  const pad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';
  const rowRem = density === 'compact' ? 2.75 : 3.75;
  const headerRem = 2.75;
  const reservedRows = Math.max(minRows ?? 0, 0);
  const minHeight =
    reservedRows > 0
      ? `calc(${headerRem}rem + ${reservedRows} * ${rowRem}rem)`
      : undefined;

  const shellStyle: CSSProperties = {
    ...(minHeight ? { minHeight } : null),
    ...style,
  };

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-border bg-card',
          className,
        )}
        style={shellStyle}
      >
        {empty ?? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No rows to show.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-x-auto rounded-xl border border-border bg-card', className)}
      style={shellStyle}
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  pad,
                  'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
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
