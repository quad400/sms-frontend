'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCreateLessonNote, useUpdateLessonNote } from '../../hooks/use-lessons';
import { lessonNoteSchema, type LessonNoteValues } from '../../schemas';
import type { LessonNote } from '../../types';
import { TextAreaField } from '../shared/fields';
import { ScopeFields } from './scope-fields';

export function LessonNoteSheet({
  open,
  onOpenChange,
  note,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: LessonNote | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <NoteForm key={note?.id ?? 'new'} note={note} onDone={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function NoteForm({ note, onDone }: { note: LessonNote | null; onDone: () => void }) {
  const ids = { title: useId(), body: useId() };
  const create = useCreateLessonNote();
  const update = useUpdateLessonNote();
  const editing = !!note;

  const form = useForm<LessonNoteValues>({
    resolver: zodResolver(lessonNoteSchema),
    defaultValues: {
      classId: note ? String(note.classId) : '',
      subjectId: note ? String(note.subjectId) : '',
      termId: note ? String(note.termId) : '',
      title: note?.title ?? '',
      body: note?.body ?? '',
    },
  });
  const { errors, isSubmitted } = form.formState;
  const scope = {
    classId: form.watch('classId'),
    subjectId: form.watch('subjectId'),
    termId: form.watch('termId'),
  };
  const busy = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (note) {
        await update.mutateAsync({ id: note.id, patch: { title: values.title, body: values.body } });
      } else {
        await create.mutateAsync({
          classId: Number(values.classId),
          subjectId: Number(values.subjectId),
          termId: Number(values.termId),
          title: values.title,
          body: values.body,
        });
      }
      toastSuccess(note ? 'Note updated' : 'Note saved', 'Your lesson note has been saved.');
      onDone();
    } catch (error) {
      toastError('Could not save note', error instanceof Error ? error.message : 'Could not save the note.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-col gap-4">
      <SheetHeader>
        <SheetTitle>{editing ? 'Edit lesson note' : 'New lesson note'}</SheetTitle>
        <SheetDescription>
          Notes are visible to students in the selected class and subject.
        </SheetDescription>
      </SheetHeader>

      <ScopeFields
        value={scope}
        disabled={editing}
        errors={{
          classId: errors.classId?.message,
          subjectId: errors.subjectId?.message,
          termId: errors.termId?.message,
        }}
        onChange={(next) => {
          const options = { shouldValidate: isSubmitted };
          form.setValue('classId', next.classId, options);
          form.setValue('subjectId', next.subjectId, options);
          form.setValue('termId', next.termId, options);
        }}
      />

      <div className="grid gap-1.5">
        <Label htmlFor={ids.title}>Title</Label>
        <Input id={ids.title} {...form.register('title')} />
        {errors.title ? <p className="text-xs text-danger">{errors.title.message}</p> : null}
      </div>
      <TextAreaField
        id={ids.body}
        label="Note"
        rows={10}
        hint={errors.body?.message}
        {...form.register('body')}
      />


      <div className="mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Publish note'}
        </Button>
      </div>
    </form>
  );
}
