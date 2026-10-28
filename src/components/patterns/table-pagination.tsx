'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function TablePagination({
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  noun = 'items',
  className,
  maxPageButtons = 3,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Plural noun for the range label, e.g. "students". */
  noun?: string;
  className?: string;
  /** How many numbered page buttons to show before collapsing with an ellipsis. */
  maxPageButtons?: number;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pageButtons = Array.from(
    { length: Math.min(pages, maxPageButtons) },
    (_, i) => i + 1,
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 pt-3',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        Showing {from}-{to} of {total.toLocaleString()} {noun}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pageButtons.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            className={cn(p === page && 'bg-teal-700 hover:bg-teal-800 cursor-pointer h-8 rounded-sm')}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        {pages > maxPageButtons ? (
          <span className="px-1 text-xs text-muted-foreground">… {pages}</span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
