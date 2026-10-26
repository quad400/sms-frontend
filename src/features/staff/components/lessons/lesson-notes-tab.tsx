'use client';

import { useMemo, useState } from 'react';
import { NotebookPen, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { useDeleteLessonNote, useLessonNotes } from '../../hooks/use-lessons';
import { useStaffLookups } from '../../hooks/use-staff-lookups';
import { formatDate, plural } from '../../lib/format';
import { QueryState } from '../../lib/shared';
import type { LessonNote } from '../../types';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { EmptyPanel } from '../shared/panel';
import { LessonNoteSheet } from './lesson-note-sheet';

export function LessonNotesTab() {
  const { can } = useSession();
  const lookups = useStaffLookups();
  const notes = useLessonNotes();
  const remove = useDeleteLessonNote();
  const [selected, setSelected] = useState<LessonNote | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<LessonNote | null>(null);

  const rows = useMemo(
    () => [...(notes.data?.data ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes.data],
  );
  const canCreate = can('academics.lesson-note.create');
  const canUpdate = can('academics.lesson-note.update');
  const canDelete = can('academics.lesson-note.delete');

  function openNote(note: LessonNote | null) {
    setSelected(note);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      {canCreate ? (
        <div className="flex justify-end">
          <Button type="button" onClick={() => openNote(null)}>
            <Plus className="size-4" aria-hidden />
            New note
          </Button>
        </div>
      ) : null}

      <QueryState
        isPending={notes.isPending}
        error={notes.error}
        onRetry={() => void notes.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={NotebookPen}
            title="No lesson notes yet"
            description="Notes you publish for a class and subject are shared with its students."
            action={
              canCreate ? (
                <Button type="button" onClick={() => openNote(null)}>
                  <Plus className="size-4" aria-hidden />
                  New note
                </Button>
              ) : undefined
            }
          />
        }
      >
        <ul className="grid gap-2.5">
          {rows.map((note) => (
            <li
              key={note.id}
              className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lookups.className(note.classId)} · {lookups.subjectName(note.subjectId)} ·{' '}
                    {lookups.termLabel(note.termId)} · {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {canUpdate ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${note.title}`}
                      onClick={() => openNote(note)}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${note.title}`}
                      onClick={() => setToDelete(note)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                {note.body}
              </p>
              {note.attachments.length > 0 ? (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="size-3.5" aria-hidden />
                  {plural(note.attachments.length, 'attachment')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </QueryState>

      <LessonNoteSheet open={open} onOpenChange={setOpen} note={selected} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(next) => {
          if (!next) setToDelete(null);
        }}
        title="Delete this note?"
        description={toDelete ? `“${toDelete.title}” will no longer be visible to students.` : undefined}
        confirmLabel="Delete note"
        destructive
        isPending={remove.isPending}
        error={remove.error?.message ?? null}
        onConfirm={() => {
          if (!toDelete) return;
          remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
