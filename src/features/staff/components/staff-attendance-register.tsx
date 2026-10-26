'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, CheckCheck, CloudOff, Lock, UsersRound } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastInfo, toastSuccess } from '@/lib/toast';
import { markEntriesPath } from '../api/attendance';
import { useRegister, useSubmitRegister } from '../hooks/use-attendance';
import { useOnline } from '../hooks/use-online';
import { useOutboxPending, useRefetchOnOutboxFlush } from '../hooks/use-outbox-pending';
import { useRegisterEditor } from '../hooks/use-register-editor';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useClassRoster } from '../hooks/use-structure';
import { formatLongDate, fullName, plural } from '../lib/format';
import { QueryState } from '../lib/shared';
import { CounterBar } from './attendance/counter-bar';
import { isMark, MARK_ORDER } from './attendance/mark-config';
import { MarkRow, type RosterRow } from './attendance/mark-row';
import { ConfirmDialog } from './shared/confirm-dialog';
import { EmptyPanel } from './shared/panel';
import { StatusBadge } from './shared/status-badge';
import { StickyActions } from './shared/sticky-actions';
import type { AttendanceMark } from '../types';

const MODES = [
  { value: 'quick' as const, label: 'Quick' },
  { value: 'detailed' as const, label: 'Detailed' },
];

export function StaffAttendanceRegister({ registerId }: { registerId: number }) {
  const { can } = useSession();
  const online = useOnline();
  const lookups = useStaffLookups();
  const register = useRegister(registerId);
  const roster = useClassRoster(register.data?.classId);
  const outbox = useOutboxPending(markEntriesPath(registerId));
  const editor = useRegisterEditor(registerId, register.data?.entries ?? [], outbox);
  const submit = useSubmitRegister(registerId);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');
  const [confirmOpen, setConfirmOpen] = useState(false);
  useRefetchOnOutboxFlush();

  const data = register.data;
  const locked = !!data && data.status !== 'open';
  const canMark = can('attendance.entry.mark') && !locked;
  const canSubmit = can('attendance.register.submit') && !locked;

  const editorError = editor.error?.message;
  useEffect(() => {
    if (editorError) toastError('Could not save marks', editorError);
  }, [editorError]);

  const rows = useMemo<RosterRow[]>(() => {
    if (!data) return [];
    const list: RosterRow[] = [];
    const seen = new Set<number>();
    for (const student of roster.data ?? []) {
      seen.add(student.id);
      list.push({
        studentId: student.id,
        name: fullName(student.firstName, student.lastName, student.middleName),
        number: student.studentNumber,
      });
    }
    // Students with an entry but no roster row (roster not permitted / moved): keep them markable.
    for (const entry of data.entries ?? []) {
      if (seen.has(entry.studentId)) continue;
      seen.add(entry.studentId);
      list.push({ studentId: entry.studentId, name: `Student ${entry.studentId}`, number: '' });
    }
    return list;
  }, [data, roster.data]);

  const counts = useMemo(() => {
    const out: Record<AttendanceMark, number> = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const row of rows) {
      const mark = editor.markOf(row.studentId);
      if (isMark(mark)) out[mark] += 1;
    }
    return out;
  }, [rows, editor]);

  async function onSave() {
    try {
      const outcome = await editor.save();
      if (outcome === 'queued') {
        toastInfo('Saved on this device', 'You’re offline — marks will sync automatically.');
      }
      if (outcome === 'saved') toastSuccess('Marks saved', 'Attendance marks have been saved.');
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
      toastSuccess('Register submitted', 'The register is now locked.');
    } catch {
      // Errors are surfaced via toasts.
    }
  }

  const absentCount = counts.absent;

  return (
    <div className="space-y-5 pb-28">
      <PageHeader
        eyebrow={
          <Link
            href="/staff/attendance"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Attendance
          </Link>
        }
        title={data ? lookups.className(data.classId) : 'Register'}
        description={data ? formatLongDate(data.date) : undefined}
        actions={data ? <StatusBadge status={data.status} /> : undefined}
      />

      <QueryState
        isPending={register.isPending}
        error={register.error}
        onRetry={() => void register.refetch()}
      >
        {data ? (
          <>
            {locked ? (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  This register was submitted and is locked. To change it, ask an administrator to
                  reopen it.
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
                <span>You’re offline. Marks you save are kept on this device and sync later.</span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <CounterBar counts={counts} />
              {canMark ? (
                <div className="flex flex-wrap items-center gap-2">
                  <SegmentedControl
                    aria-label="Marking mode"
                    value={mode}
                    onValueChange={setMode}
                    options={MODES}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      editor.setMany(
                        rows.map((row) => row.studentId),
                        'present',
                        editor.markOf,
                      )
                    }
                  >
                    <CheckCheck aria-hidden />
                    Mark all present
                  </Button>
                </div>
              ) : null}
            </div>

            {rows.length === 0 ? (
              <EmptyPanel
                icon={UsersRound}
                title="No students on this register"
                description={
                  roster.error
                    ? 'The class roster could not be loaded.'
                    : 'There are no active students enrolled in this class.'
                }
              />
            ) : (
              <>
                {mode === 'quick' && canMark ? (
                  <p className="text-xs text-muted-foreground">
                    Everyone starts as present. Tap a row to cycle {MARK_ORDER.join(' → ')}.
                  </p>
                ) : null}
                <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                  {rows.map((row) => (
                    <MarkRow
                      key={row.studentId}
                      row={row}
                      mark={editor.markOf(row.studentId)}
                      mode={mode}
                      readOnly={!canMark}
                      edited={editor.isEdited(row.studentId)}
                      onDevice={editor.isOnDevice(row.studentId)}
                      onChange={(mark) => editor.setMark(row.studentId, mark)}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        ) : null}
      </QueryState>

      {data && !locked && (canMark || canSubmit) ? (
        <StickyActions
          status={
            editor.unsavedCount > 0
              ? plural(editor.unsavedCount, 'unsaved change')
              : 'All changes saved'
          }
        >
          {canMark ? (
            <Button
              type="button"
              variant="outline"
              disabled={editor.unsavedCount === 0 || editor.isSaving}
              onClick={() => void onSave()}
            >
              {editor.isSaving ? 'Saving…' : 'Save'}
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="button"
              disabled={!online || rows.length === 0 || editor.isSaving}
              title={online ? undefined : 'Reconnect to submit the register'}
              onClick={() => setConfirmOpen(true)}
            >
              Submit register
            </Button>
          ) : null}
        </StickyActions>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Submit register?"
        description="Submitting locks this register. Only an administrator can reopen it."
        confirmLabel="Submit register"
        isPending={editor.isSaving || submit.isPending}
        error={submit.error?.message ?? null}
        onConfirm={() => void onConfirmSubmit()}
      >
        <div className="space-y-2 text-sm">
          <CounterBar counts={counts} />
          {absentCount > 0 ? (
            <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-900">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Parents of {plural(absentCount, 'absent student')} will be notified.
              </span>
            </p>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  );
}
