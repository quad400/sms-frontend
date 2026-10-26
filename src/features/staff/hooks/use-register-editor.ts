'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { newClientRef, type OutboxItem } from '@/lib/offline/outbox';
import type { AttendanceEntry, AttendanceMark, MarkEntryInput } from '../types';
import { useMarkEntries } from './use-attendance';

type Edit = {
  mark: AttendanceMark;
  /** Fresh per change: the backend stores the latest ref against the entry. */
  clientRef: string;
  /** True once the change is safely queued in the offline outbox. */
  onDevice: boolean;
};

export type SaveOutcome = 'none' | 'saved' | 'queued';

/** Marks waiting in the offline outbox for this register, latest write wins. */
function pendingMarks(items: OutboxItem[]): Map<number, string> {
  const out = new Map<number, string>();
  for (const item of items) {
    const body = item.body as { entries?: Array<{ studentId?: number; markCode?: string }> } | null;
    for (const entry of body?.entries ?? []) {
      if (typeof entry.studentId === 'number' && typeof entry.markCode === 'string') {
        out.set(entry.studentId, entry.markCode);
      }
    }
  }
  return out;
}

/**
 * Local editing state for one register: unsaved marks, marks queued offline, and the
 * effective mark per student (edit → outbox → server → present).
 */
export function useRegisterEditor(
  registerId: number,
  serverEntries: AttendanceEntry[],
  outbox: OutboxItem[],
) {
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const mutation = useMarkEntries(registerId);

  const server = useMemo(
    () => new Map(serverEntries.map((entry) => [entry.studentId, entry.mark])),
    [serverEntries],
  );
  const queued = useMemo(() => pendingMarks(outbox), [outbox]);

  const markOf = useCallback(
    (studentId: number): string =>
      edits[studentId]?.mark ?? queued.get(studentId) ?? server.get(studentId) ?? 'present',
    [edits, queued, server],
  );

  const setMark = useCallback((studentId: number, mark: AttendanceMark) => {
    setEdits((previous) => ({
      ...previous,
      [studentId]: { mark, clientRef: newClientRef(), onDevice: false },
    }));
  }, []);

  const setMany = useCallback(
    (studentIds: number[], mark: AttendanceMark, current: (id: number) => string) => {
      setEdits((previous) => {
        const next = { ...previous };
        for (const id of studentIds) {
          if (current(id) === mark) continue;
          next[id] = { mark, clientRef: newClientRef(), onDevice: false };
        }
        return next;
      });
    },
    [],
  );

  const unsaved = useMemo(
    () => Object.entries(edits).filter(([, edit]) => !edit.onDevice),
    [edits],
  );

  const save = useCallback(async (): Promise<SaveOutcome> => {
    if (unsaved.length === 0) return 'none';
    const batch: MarkEntryInput[] = unsaved.map(([studentId, edit]) => ({
      clientRef: edit.clientRef,
      studentId: Number(studentId),
      markCode: edit.mark,
    }));
    const result = await mutation.mutateAsync(batch);
    setEdits((previous) => {
      const next = { ...previous };
      for (const sent of batch) {
        const current = next[sent.studentId];
        if (!current || current.clientRef !== sent.clientRef) continue; // edited again meanwhile
        if (result.queued) next[sent.studentId] = { ...current, onDevice: true };
        else delete next[sent.studentId];
      }
      return next;
    });
    return result.queued ? 'queued' : 'saved';
  }, [mutation, unsaved]);

  // Warn before leaving with changes that exist only in this tab.
  useEffect(() => {
    if (unsaved.length === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved.length]);

  return {
    markOf,
    setMark,
    setMany,
    save,
    unsavedCount: unsaved.length,
    isEdited: (studentId: number) => !!edits[studentId] && !edits[studentId].onDevice,
    isOnDevice: (studentId: number) => queued.has(studentId),
    isSaving: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
