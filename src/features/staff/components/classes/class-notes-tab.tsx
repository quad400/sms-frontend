'use client';

import Link from 'next/link';
import { NotebookText } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useLessonNotes } from '../../hooks/use-lessons';
import { useStaffLookups } from '../../hooks/use-staff-lookups';
import { formatDate } from '../../lib/format';
import { QueryState } from '../../lib/shared';
import { EmptyPanel } from '../shared/panel';

export function ClassNotesTab({ classId }: { classId: number }) {
  const notes = useLessonNotes({ classId });
  const lookups = useStaffLookups();
  const rows = notes.data?.data ?? [];

  return (
    <QueryState
      isPending={notes.isPending}
      error={notes.error}
      onRetry={() => void notes.refetch()}
      isEmpty={rows.length === 0}
      empty={
        <EmptyPanel
          icon={NotebookText}
          title="No lesson notes for this class"
          description="Notes you share with this class will appear here."
          action={
            <Link href="/staff/lessons" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Write a note
            </Link>
          }
        />
      }
    >
      <ul className="space-y-2">
        {rows.map((note) => (
          <li
            key={note.id}
            className="rounded-xl border border-border bg-card p-3.5 shadow-[var(--shadow-card)]"
          >
            <p className="text-sm font-semibold">{note.title}</p>
            <p className="text-xs text-muted-foreground">
              {lookups.subjectName(note.subjectId)} · {formatDate(note.updatedAt)}
            </p>
            <p className="mt-1.5 line-clamp-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {note.body}
            </p>
          </li>
        ))}
      </ul>
    </QueryState>
  );
}
