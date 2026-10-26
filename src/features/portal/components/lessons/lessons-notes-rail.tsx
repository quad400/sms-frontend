'use client';

import { FileText, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { str } from '@/lib/utils/record';
import { formatDate, toRecords } from '../../lib/format';

export function LessonsNotesRail({
  notes,
  onViewAll,
  limit = 5,
}: {
  notes: Record<string, unknown>[];
  onViewAll?: () => void;
  limit?: number;
}) {
  const preview = notes.slice(0, limit);

  return (
    <aside
      aria-labelledby="lesson-notes-rail-heading"
      className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2
            id="lesson-notes-rail-heading"
            className="font-heading text-base font-semibold"
          >
            Lesson notes
          </h2>
          <p className="text-xs text-muted-foreground">Materials from your teachers</p>
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-academic/10 text-academic">
          <FileText className="size-4" aria-hidden />
        </span>
      </div>

      {preview.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          No lesson notes yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {preview.map((note, index) => {
            const attachments = toRecords(note.attachments);
            const meta = [str(note.subjectName), formatDate(note.publishedAt ?? note.createdAt)]
              .filter(Boolean)
              .join(' · ');
            return (
              <li key={str(note.id, String(index))} className="py-3 first:pt-0 last:pb-0">
                <p className="truncate text-sm font-semibold">
                  {str(note.title, 'Lesson note')}
                </p>
                {meta ? <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p> : null}
                {attachments.length > 0 ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Paperclip className="size-3" aria-hidden />
                    {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {notes.length > 0 && onViewAll ? (
        <Button type="button" variant="outline" className="w-full" onClick={onViewAll}>
          View all notes ({notes.length})
        </Button>
      ) : null}
    </aside>
  );
}
