'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, CloudOff, Inbox, Lock } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastInfo, toastSuccess } from '@/lib/toast';
import { scoresPath } from '../api/assessments';
import { useAssessment, useScores, useSubmitAssessment } from '../hooks/use-assessments';
import { useOnline } from '../hooks/use-online';
import { useOutboxPending, useRefetchOnOutboxFlush } from '../hooks/use-outbox-pending';
import { useScoreEditor } from '../hooks/use-score-editor';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useClassRoster } from '../hooks/use-structure';
import { fullName, plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import { ConfirmDialog } from './shared/confirm-dialog';
import { EmptyPanel } from './shared/panel';
import { StatusBadge } from './shared/status-badge';
import { StickyActions } from './shared/sticky-actions';
import { ScoreGrid, type ScoreRowModel } from './scores/score-grid';

export function StaffScoreEntry({ assessmentId }: { assessmentId: number }) {
  const { can } = useSession();
  const online = useOnline();
  const lookups = useStaffLookups();
  const assessment = useAssessment(assessmentId);
  const scores = useScores(assessmentId);
  const roster = useClassRoster(assessment.data?.classId);
  const outbox = useOutboxPending(scoresPath(assessmentId));
  const submit = useSubmitAssessment(assessmentId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useRefetchOnOutboxFlush();

  const data = assessment.data;
  const locked = !!data && data.status !== 'draft';
  const canEnter = can('assessment.score.enter') && !locked;
  const canSubmit = can('assessment.score.submit') && !locked;

  const editor = useScoreEditor({
    assessmentId,
    maxScore: data?.maxScore ?? 0,
    scores: scores.data ?? [],
    outbox,
    readOnly: !canEnter,
  });

  const editorError = editor.error?.message;
  useEffect(() => {
    if (editorError) toastError('Could not save scores', editorError);
  }, [editorError]);

  const rows = useMemo<ScoreRowModel[]>(() => {
    const list: ScoreRowModel[] = [];
    const seen = new Set<number>();
    for (const student of roster.data ?? []) {
      seen.add(student.id);
      list.push({
        studentId: student.id,
        name: `${student.lastName}, ${fullName(student.firstName, null, student.middleName)}`,
        number: student.studentNumber,
      });
    }
    for (const score of scores.data ?? []) {
      if (seen.has(score.studentId)) continue;
      seen.add(score.studentId);
      list.push({ studentId: score.studentId, name: `Student ${score.studentId}`, number: '' });
    }
    return list;
  }, [roster.data, scores.data]);

  const missing = useMemo(
    () =>
      rows.filter((row) => {
        const cell = editor.cellOf(row.studentId);
        return !cell.absent && cell.text.trim() === '';
      }),
    [rows, editor],
  );
  const enteredCount = rows.length - missing.length;

  async function onSave() {
    try {
      const outcome = await editor.save();
      if (outcome === 'queued') {
        toastInfo('Saved on this device', 'You’re offline — scores will sync automatically.');
      }
      if (outcome === 'saved') toastSuccess('Draft saved', 'Your score changes have been saved.');
    } catch {
      // Surfaced via the `editor.error` toast.
    }
  }

  async function onConfirmSubmit() {
    try {
      const outcome = await editor.save();
      if (outcome === 'queued') {
        setConfirmOpen(false);
        toastInfo('Saved on this device', 'Submit once you’re back online.');
        return;
      }
      await submit.mutateAsync();
      setConfirmOpen(false);
      toastSuccess('Scores submitted', 'The scores are now locked.');
    } catch {
      // Errors are shown in the dialog.
    }
  }

  const saveStatus = editor.isSaving
    ? 'Saving…'
    : editor.invalidCount > 0
      ? `${plural(editor.invalidCount, 'value')} out of range`
      : editor.unsavedCount > 0
        ? `${plural(editor.unsavedCount, 'unsaved change')} · autosaves every 10 s`
        : editor.lastSavedAt
          ? `Saved ${editor.lastSavedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
          : 'All changes saved';

  return (
    <div className="space-y-5 pb-28">
      <PageHeader
        eyebrow={
          <Link
            href="/staff/scores"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Scores
          </Link>
        }
        title={data?.title ?? 'Score entry'}
        description={
          data
            ? `${lookups.className(data.classId)} · ${lookups.subjectName(data.subjectId)} · ${data.componentName} (max ${data.maxScore})`
            : undefined
        }
        actions={data ? <StatusBadge status={data.status} /> : undefined}
      />

      <QueryState
        isPending={assessment.isPending || scores.isPending}
        error={assessment.error ?? scores.error}
        onRetry={() => {
          void assessment.refetch();
          void scores.refetch();
        }}
        isEmpty={!data}
        empty={
          <EmptyPanel
            icon={Inbox}
            title="Assessment not available"
            description="This assessment doesn’t exist or isn’t part of your allocations."
          />
        }
      >
        {data ? (
          <>
            {locked ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  These scores were submitted and are locked. To request a correction, contact the
                  exams officer.
                </span>
              </p>
            ) : null}

            {outbox.length > 0 ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {plural(outbox.length, 'save')} stored on this device, waiting to sync
                  {online ? '…' : ' when you’re back online.'}
                </span>
              </p>
            ) : null}

            {!online && !locked ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>You’re offline. Scores you save are kept on this device and sync later.</span>
              </p>
            ) : null}

            <p className="text-sm text-muted-foreground">
              <span className="font-mono tabular-nums">{enteredCount}</span> of{' '}
              <span className="font-mono tabular-nums">{rows.length}</span> entered
              {canEnter ? ' · Enter or ↓ moves to the next student' : ''}
            </p>

            {rows.length === 0 ? (
              <EmptyPanel
                title="No students to score"
                description={
                  roster.error
                    ? 'The class roster could not be loaded.'
                    : 'There are no active students enrolled in this class.'
                }
              />
            ) : (
              <ScoreGrid
                rows={rows}
                maxScore={data.maxScore}
                cellOf={editor.cellOf}
                onText={editor.setText}
                onAbsent={editor.setAbsent}
              />
            )}
          </>
        ) : null}
      </QueryState>

      {data && !locked && (canEnter || canSubmit) ? (
        <StickyActions status={saveStatus}>
          {canEnter ? (
            <Button
              type="button"
              variant="outline"
              disabled={editor.unsavedCount === 0 || editor.isSaving}
              onClick={() => void onSave()}
            >
              {editor.isSaving ? 'Saving…' : 'Save draft'}
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="button"
              disabled={!online || rows.length === 0 || editor.isSaving || editor.invalidCount > 0}
              title={online ? undefined : 'Reconnect to submit scores'}
              onClick={() => setConfirmOpen(true)}
            >
              Submit scores
            </Button>
          ) : null}
        </StickyActions>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit scores?"
        description="Submitting locks these scores. Changes afterwards need an administrator."
        confirmLabel="Submit scores"
        isPending={editor.isSaving || submit.isPending}
        error={submit.error?.message ?? null}
        onConfirm={() => void onConfirmSubmit()}
      >
        {missing.length > 0 ? (
          <div className="space-y-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-900">
            <p className="flex items-start gap-2 font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {plural(missing.length, 'student')} without a score
            </p>
            <p className="text-xs">
              {missing
                .slice(0, 8)
                .map((row) => row.name)
                .join('; ')}
              {missing.length > 8 ? `; and ${missing.length - 8} more` : ''}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Every student has a score or an absence.</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
