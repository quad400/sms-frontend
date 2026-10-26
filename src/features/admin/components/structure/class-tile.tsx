import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { SchoolClass } from '../../api/structure';

export function ClassTile({ schoolClass }: { schoolClass: SchoolClass }) {
  const title = schoolClass.name || schoolClass.armName || `Class ${schoolClass.id}`;

  return (
    <Link
      href={`/admin/classes/${schoolClass.id}`}
      className={cn(
        'group flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-semibold tracking-tight">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Arm {schoolClass.armName || '—'}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted font-heading text-sm font-semibold">
          {(schoolClass.armName || title).slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-heading text-xl font-semibold tabular-nums text-foreground">
            {schoolClass.studentCount ?? '—'}
          </span>{' '}
          students
        </p>
        <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
          Open →
        </span>
      </div>
    </Link>
  );
}
