'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { newClientRef, type OutboxItem } from '@/lib/offline/outbox';
import { parseScoreText, scoreToText } from '../lib/scores';
import type { Score, ScoreInput } from '../types';
import { useSaveScores } from './use-assessments';

type Edit = { text: string; absent: boolean; clientRef: string; onDevice: boolean };

export type Cell = {
  text: string;
  absent: boolean;
  error: string | null;
  edited: boolean;
  onDevice: boolean;
  locked: boolean;
};

export type ScoreSaveOutcome = 'none' | 'saved' | 'queued';

const AUTOSAVE_MS = 10_000;

function pendingScores(items: OutboxItem[]): Map<number, { text: string; absent: boolean }> {
  const out = new Map<number, { text: string; absent: boolean }>();
  for (const item of items) {
    const body = item.body as {
      scores?: Array<{ studentId?: number; score?: number | null; isAbsent?: boolean }>;
    } | null;
    for (const row of body?.scores ?? []) {
      if (typeof row.studentId !== 'number') continue;
      out.set(row.studentId, { text: scoreToText(row.score), absent: row.isAbsent === true });
    }
  }
  return out;
}

/**
 * Editing state for one assessment's score grid: typed text per student, validation against
 * the max score, autosave every 10 s, and offline queueing through the save mutation.
 */
export function useScoreEditor({
  assessmentId,
  maxScore,
  scores,
  outbox,
  readOnly,
}: {
  assessmentId: number;
  maxScore: number;
  scores: Score[];
  outbox: OutboxItem[];
  readOnly: boolean;
}) {
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const mutation = useSaveScores(assessmentId);

  const server = useMemo(() => new Map(scores.map((score) => [score.studentId, score])), [scores]);
  const queued = useMemo(() => pendingScores(outbox), [outbox]);

  const baseline = useCallback(
    (studentId: number): { text: string; absent: boolean } => {
      const pending = queued.get(studentId);
      if (pending) return pending;
      const row = server.get(studentId);
      return { text: scoreToText(row?.score), absent: row?.isAbsent ?? false };
    },
    [queued, server],
  );

  const cellOf = useCallback(
    (studentId: number): Cell => {
      const edit = edits[studentId];
      const base = baseline(studentId);
      const text = edit?.text ?? base.text;
      const absent = edit?.absent ?? base.absent;
      const parsed = absent ? ({ ok: true, value: null } as const) : parseScoreText(text, maxScore);
      return {
        text,
        absent,
        error: parsed.ok ? null : parsed.message,
        edited: !!edit && !edit.onDevice,
        onDevice: queued.has(studentId),
        locked: readOnly || (server.get(studentId)?.isLocked ?? false),
      };
    },
    [baseline, edits, maxScore, queued, readOnly, server],
  );

  const applyEdit = useCallback(
    (studentId: number, text: string, absent: boolean) => {
      setEdits((previous) => {
        const base = baseline(studentId);
        const next = { ...previous };
        if (text === base.text && absent === base.absent) {
          delete next[studentId];
        } else {
          next[studentId] = { text, absent, clientRef: newClientRef(), onDevice: false };
        }
        return next;
      });
    },
    [baseline],
  );

  const setText = useCallback(
    (studentId: number, text: string) => applyEdit(studentId, text, false),
    [applyEdit],
  );

  const setAbsent = useCallback(
    (studentId: number, absent: boolean) => applyEdit(studentId, '', absent),
    [applyEdit],
  );

  const dirty = useMemo(() => Object.entries(edits).filter(([, edit]) => !edit.onDevice), [edits]);
  const invalidCount = useMemo(
    () =>
      dirty.filter(([, edit]) => !edit.absent && !parseScoreText(edit.text, maxScore).ok).length,
    [dirty, maxScore],
  );

  const save = useCallback(async (): Promise<ScoreSaveOutcome> => {
    const batch: ScoreInput[] = [];
    for (const [studentId, edit] of dirty) {
      const parsed = edit.absent ? ({ ok: true, value: null } as const) : parseScoreText(edit.text, maxScore);
      if (!parsed.ok) continue;
      const row: ScoreInput = { clientRef: edit.clientRef, studentId: Number(studentId) };
      if (edit.absent) row.isAbsent = true;
      else if (parsed.value !== null) row.score = parsed.value;
      batch.push(row);
    }
    if (batch.length === 0) return 'none';

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
    if (!result.queued) setLastSavedAt(new Date());
    return result.queued ? 'queued' : 'saved';
  }, [dirty, maxScore, mutation]);

  // Autosave: flush valid unsaved cells every 10 s while editing is allowed.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  const busyRef = useRef(false);
  useEffect(() => {
    busyRef.current = mutation.isPending;
  }, [mutation.isPending]);
  useEffect(() => {
    if (readOnly) return;
    const id = window.setInterval(() => {
      if (busyRef.current) return;
      void saveRef.current().catch(() => {
        // Surfaced via `error`; the next tick retries with the same clientRefs.
      });
    }, AUTOSAVE_MS);
    return () => window.clearInterval(id);
  }, [readOnly]);

  useEffect(() => {
    if (dirty.length === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty.length]);

  return {
    cellOf,
    setText,
    setAbsent,
    save,
    unsavedCount: dirty.length,
    invalidCount,
    isSaving: mutation.isPending,
    error: mutation.error,
    lastSavedAt,
  };
}
