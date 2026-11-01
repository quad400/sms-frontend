'use client';

import { ErrorState } from '@/components/patterns/error-state';
import { EmptyState } from '@/components/patterns/empty-state';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { ConfirmDialog, ReasonDialog } from '@/components/patterns/confirm-dialog';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { LessonNote } from '../../api/academics';
import {
  useApproveLessonNote,
  useFileDownloadUrl,
  useLessonNotes,
  useRejectLessonNote,
} from '../../hooks/use-academics';
import { useStaffList } from '../../hooks/use-staff';
import { useClasses, useSessions, useSubjects, useTerms } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { LessonNotesSummary } from './lesson-notes-summary';
import { LessonNotesTable, type LessonNoteTab } from './lesson-notes-table';

export function LessonNotesList() {
  const { campusQuery, density } = useAdminCampus();
  const [tab, setTab] = useState<LessonNoteTab>('submitted');
  const [page, setPage] = useState(1);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [termId, setTermId] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [selected, setSelected] = useState<LessonNote | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);

  const sessions = useSessions(campusQuery);
  const activeSession = (sessions.data ?? []).find((s) => s.isActive);
  const terms = useTerms(
    activeSession ? String(activeSession.id) : undefined,
    !!activeSession,
  );
  const classes = useClasses({
    campusId: campusQuery,
    sessionId: activeSession ? String(activeSession.id) : undefined,
    key: `${campusQuery ?? ''}-${activeSession?.id ?? ''}`,
  });
  const subjects = useSubjects();
  const staff = useStaffList({ campusId: campusQuery, status: 'active', page: 1 });

  const apiStatus = tab === '' ? undefined : tab;

  const list = useLessonNotes({
    status: apiStatus,
    page,
    classId: classId || undefined,
    subjectId: subjectId || undefined,
    termId: termId || undefined,
    weekNumber: weekNumber || undefined,
  });
  const awaiting = useLessonNotes({ status: 'submitted', page: 1 });
  const approved = useLessonNotes({ status: 'approved', page: 1 });
  const rejected = useLessonNotes({ status: 'rejected', page: 1 });

  const approve = useApproveLessonNote();
  const reject = useRejectLessonNote();

  const staffById = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of staff.data?.data ?? []) {
      m.set(s.id, fullName(s.firstName, s.lastName, s.middleName));
    }
    return m;
  }, [staff.data?.data]);

  const classById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of classes.data ?? []) m.set(c.id, c.name);
    return m;
  }, [classes.data]);

  const subjectById = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of subjects.data ?? []) m.set(s.id, s.name);
    return m;
  }, [subjects.data]);

  const enrich = (r: LessonNote): LessonNote => ({
    ...r,
    staffName: r.staffName ?? staffById.get(r.staffId),
    className: r.className ?? classById.get(r.classId),
    subjectName: r.subjectName ?? subjectById.get(r.subjectId),
  });

  const rows = useMemo(
    () => (list.data?.data ?? []).map(enrich),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list.data?.data, staffById, classById, subjectById],
  );

  const selectedNote = selected ? enrich(selected) : null;
  const primaryFileId = selectedNote?.attachments[0]?.fileId ?? null;
  const fileUrl = useFileDownloadUrl(
    primaryFileId,
    selectedNote != null && primaryFileId != null,
  );

  const total = list.data?.meta.total ?? 0;
  const pageSize = list.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const tabCounts = {
    all: total,
    submitted: awaiting.data?.meta.total ?? 0,
    approved: approved.data?.meta.total ?? 0,
    rejected: rejected.data?.meta.total ?? 0,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lesson notes review"
        description="Weekly teaching documents submitted by faculty for class–subject allocations. Review and validate attachments in-panel."
      />

      <LessonNotesSummary
        awaiting={tabCounts.submitted}
        approved={tabCounts.approved}
        rejected={tabCounts.rejected}
      />

      <LessonNotesTable
        rows={rows}
        isPending={list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        density={density}
        tab={tab}
        onTabChange={(v) => {
          setTab(v);
          setPage(1);
        }}
        tabCounts={tabCounts}
        classId={classId}
        onClassIdChange={(v) => {
          setClassId(v);
          setPage(1);
        }}
        subjectId={subjectId}
        onSubjectIdChange={(v) => {
          setSubjectId(v);
          setPage(1);
        }}
        termId={termId}
        onTermIdChange={(v) => {
          setTermId(v);
          setPage(1);
        }}
        weekNumber={weekNumber}
        onWeekNumberChange={(v) => {
          setWeekNumber(v);
          setPage(1);
        }}
        classes={classes.data ?? []}
        subjects={subjects.data ?? []}
        terms={terms.data ?? []}
        page={page}
        pages={pages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onOpen={(row) => setSelected(row)}
      />

      <Sheet open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            <SheetTitle>{selectedNote?.title ?? 'Lesson note'}</SheetTitle>
            <SheetDescription>
              {[
                selectedNote?.subjectName ??
                  (selectedNote ? `Subject ${selectedNote.subjectId}` : null),
                selectedNote?.className ??
                  (selectedNote ? `Class ${selectedNote.classId}` : null),
                selectedNote?.weekNumber != null
                  ? `Week ${selectedNote.weekNumber}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Review submitted teaching document'}
            </SheetDescription>
          </SheetHeader>

          {selectedNote ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedNote.status} />
                {selectedNote.staffName ? (
                  <span className="text-xs text-muted-foreground">
                    {selectedNote.staffName}
                  </span>
                ) : null}
              </div>

              {selectedNote.reviewNote ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <p className="text-[11px] font-semibold uppercase tracking-wide">
                    Review note
                  </p>
                  <p className="mt-1">{selectedNote.reviewNote}</p>
                </div>
              ) : null}

              {selectedNote.body ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {selectedNote.body}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Document
                </p>
                {primaryFileId == null ? (
                  <EmptyState
                    title="No attachment"
                    description="No attachment on this note."
                    className="py-6"
                  />
                ) : (
                  <QueryState
                    isPending={fileUrl.isPending}
                    error={fileUrl.error}
                    onRetry={() => void fileUrl.refetch()}
                  >
                    {fileUrl.data?.url ? (
                      <div className="space-y-2">
                        <iframe
                          title="Lesson note document"
                          src={fileUrl.data.url}
                          className="h-[min(55vh,28rem)] w-full rounded-xl border border-border bg-muted/20"
                        />
                        <a
                          href={fileUrl.data.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-teal-700 hover:underline"
                        >
                          Open / download attachment
                        </a>
                      </div>
                    ) : (
                      <ErrorState
                        title="Couldn’t open file"
                        description="Could not resolve file URL."
                        className="py-6"
                        onRetry={() => void fileUrl.refetch()}
                      />
                    )}
                  </QueryState>
                )}
              </div>

              <PermissionGate permission="academics.lesson-note.approve">
                {selectedNote.status === 'submitted' ? (
                  <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      className="flex-1 bg-teal-700 hover:bg-teal-800"
                      onClick={() => setApproveId(selectedNote.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-danger/30 text-danger hover:bg-danger/5"
                      onClick={() => setRejectId(selectedNote.id)}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </PermissionGate>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={approveId !== null}
        onOpenChange={(o) => !o && setApproveId(null)}
        title="Approve lesson note?"
        description="Confirm this document is valid for the class and subject this week."
        confirmLabel="Approve"
        isPending={approve.isPending}
        onConfirm={() => {
          if (approveId == null) return;
          approve.mutate(approveId, {
            onSuccess: () => {
              toastSuccess('Lesson note approved');
              setApproveId(null);
              setSelected(null);
            },
            onError: (e) => toastError('Could not approve', e.message),
          });
        }}
      />

      <ReasonDialog
        open={rejectId !== null}
        onOpenChange={(o) => !o && setRejectId(null)}
        title="Reject lesson note?"
        description="The teacher can revise and resubmit after rejection."
        confirmLabel="Reject"
        destructive
        reasonLabel="Reason"
        isPending={reject.isPending}
        onConfirm={(reason) => {
          if (rejectId == null) return;
          reject.mutate(
            { id: rejectId, reason },
            {
              onSuccess: () => {
                toastSuccess('Lesson note rejected');
                setRejectId(null);
                setSelected(null);
              },
              onError: (e) => toastError('Could not reject', e.message),
            },
          );
        }}
      />
    </div>
  );
}

export { LessonNotesList as LessonNotesPage };
