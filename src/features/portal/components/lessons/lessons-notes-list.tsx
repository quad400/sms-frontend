'use client';

import { FileText, Paperclip } from 'lucide-react';
import { str } from '@/lib/utils/record';
import { formatDate, toRecords } from '../../lib/format';

export function LessonsNotesList({ notes }: { notes: Record<string, unknown>[] }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-academic/10 text-academic">
          <FileText className="size-5" aria-hidden />
        </span>
        <p className="font-heading text-lg font-semibold">No lesson notes</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Notes and attachments from your teachers will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note, index) => {
        const attachments = toRecords(note.attachments);
        const meta = [str(note.subjectName), formatDate(note.publishedAt ?? note.createdAt)]
          .filter(Boolean)
          .join(' · ');
        return (
          <article
            key={str(note.id, String(index))}
            className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div>
              <h3 className="font-heading text-base font-semibold">
                {str(note.title, 'Lesson note')}
              </h3>
              {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
            </div>
            {str(note.body) ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{str(note.body)}</p>
            ) : null}
            {attachments.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {attachments.map((file, i) => (
                  <li
                    key={str(file.id, String(i))}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    <Paperclip className="size-3.5" aria-hidden />
                    {str(file.fileName ?? file.name) || `Attachment ${i + 1}`}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
