'use client';

import { useMemo } from 'react';
import { usePortalLessonNotes } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentLessons() {
  const query = usePortalLessonNotes();
  const notes = useMemo(
    () =>
      asArray(query.data)
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [query.data],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lessons</h1>
        <p className="text-sm text-muted-foreground">Notes shared by your teachers.</p>
      </div>

      <QueryState isPending={query.isPending} error={query.error} isEmpty={notes.length === 0}>
        <div className="space-y-3">
          {notes.map((note, index) => {
            const attachments = asArray(note.attachments)
              .map((a) => asRecord(a))
              .filter((a): a is Record<string, unknown> => !!a);
            return (
              <Card key={num(note.id, index)}>
                <CardHeader>
                  <CardTitle className="text-base">{str(note.title, 'Lesson note')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="whitespace-pre-wrap text-muted-foreground">{str(note.body)}</p>
                  {attachments.length > 0 ? (
                    <ul className="space-y-1">
                      {attachments.map((file) => (
                        <li key={num(file.id)} className="text-brand">
                          Attachment #{num(file.fileId)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}
