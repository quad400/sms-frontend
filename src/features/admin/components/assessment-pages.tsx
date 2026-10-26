'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AsyncJobBanner } from '@/components/patterns/async-job-banner';
import { ConfirmDialog, ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { asRecord, str } from '@/lib/utils/record';
import type {
  Assessment,
  GradingScale,
  ReportCard,
  ResultSheet,
  Score,
} from '../api/assessment';
import {
  useApproveResultSheet,
  useAssessment,
  useAssessments,
  useComputeResultSheet,
  useDocumentTemplate,
  useDocumentTemplates,
  useDuplicateGradingScale,
  useGradingScale,
  useGradingScales,
  usePatchLockedScore,
  usePreviewDocumentTemplate,
  usePublishResultSheet,
  useRegenerateReportCard,
  useRejectResultSheet,
  useReportCard,
  useReportCards,
  useResultSheet,
  useResultSheets,
  useSaveDocumentTemplate,
  useSaveGradingScale,
  useSaveScheme,
  useSaveWorkflow,
  useSchemes,
  useScores,
  useSubmitAssessment,
  useWorkflows,
} from '../hooks/use-assessment';
import { useRoles } from '../hooks/use-roles';
import { useLevels } from '../hooks/use-structure';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

type Band = {
  minScore: number;
  maxScore: number;
  grade: string;
  remark?: string;
  gradePoint?: number;
};

function validateBands(bands: Band[]): string | null {
  const sorted = [...bands].sort((a, b) => a.minScore - b.minScore);
  for (let i = 0; i < sorted.length; i++) {
    const b = sorted[i]!;
    if (b.minScore > b.maxScore) return `Band ${b.grade}: min > max`;
    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (b.minScore <= prev.maxScore) return `Overlap between ${prev.grade} and ${b.grade}`;
      if (b.minScore > prev.maxScore + 1e-9 && b.minScore - prev.maxScore > 0.01) {
        return `Gap between ${prev.grade} and ${b.grade}`;
      }
    }
  }
  return null;
}

export function GradingScalesPage() {
  const scales = useGradingScales();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = useGradingScale(selectedId);
  const [name, setName] = useState('');
  const [bands, setBands] = useState<Band[]>([]);
  const bandError = validateBands(bands);

  useEffect(() => {
    if (!detail.data) return;
    setName(detail.data.name);
    setBands(
      (detail.data.bands ?? []).map((b) => ({
        minScore: b.minScore,
        maxScore: b.maxScore,
        grade: b.grade,
        remark: b.remark ?? undefined,
        gradePoint: b.gradePoint ?? undefined,
      })),
    );
  }, [detail.data]);

  const save = useSaveGradingScale();
  function saveScale() {
    save.mutate(
      { id: selectedId, body: { name, bands } },
      {
        onSuccess: (row) => {
          toastSuccess('Scale saved');
          setSelectedId(row.id);
        },
        onError: (e) => {
          if (e instanceof ApiClientError && /409|conflict|approved/i.test(e.message + e.mapped.code)) {
            toastError('Scale locked', `${e.message} — duplicate as a new scale instead.`);
            return;
          }
          toastError('Could not save', e.message);
        },
      },
    );
  }

  const duplicate = useDuplicateGradingScale();
  function duplicateScale() {
    duplicate.mutate(
      { name: `${name} (copy)`, bands },
      {
        onSuccess: (row) => {
          toastSuccess('Duplicated');
          setSelectedId(row.id);
        },
        onError: (e) => toastError('Could not duplicate', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Grading scales"
        actions={
          <PermissionGate permission="assessment.grading-scale.create">
            <Button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setName('New scale');
                setBands([{ minScore: 0, maxScore: 39, grade: 'F' }, { minScore: 40, maxScore: 100, grade: 'P' }]);
              }}
            >
              New scale
            </Button>
          </PermissionGate>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
        <QueryState isPending={scales.isPending} error={scales.error}>
          <ul className="space-y-1 rounded-xl border border-border p-2">
            {(scales.data ?? []).map((s: GradingScale) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedId === s.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </QueryState>
        <div className="space-y-3 rounded-xl border border-border p-4">
          {(selectedId != null || name) ? (
            <>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {bandError ? <p className="text-sm text-destructive">{bandError}</p> : null}
              <div className="space-y-2">
                {bands.map((b, i) => (
                  <div key={i} className="grid grid-cols-5 gap-1">
                    <Input
                      type="number"
                      value={b.minScore}
                      onChange={(e) =>
                        setBands((prev) =>
                          prev.map((row, idx) =>
                            idx === i ? { ...row, minScore: Number(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                    <Input
                      type="number"
                      value={b.maxScore}
                      onChange={(e) =>
                        setBands((prev) =>
                          prev.map((row, idx) =>
                            idx === i ? { ...row, maxScore: Number(e.target.value) } : row,
                          ),
                        )
                      }
                    />
                    <Input
                      value={b.grade}
                      onChange={(e) =>
                        setBands((prev) =>
                          prev.map((row, idx) => (idx === i ? { ...row, grade: e.target.value } : row)),
                        )
                      }
                      placeholder="Grade"
                    />
                    <Input
                      value={b.remark ?? ''}
                      onChange={(e) =>
                        setBands((prev) =>
                          prev.map((row, idx) => (idx === i ? { ...row, remark: e.target.value } : row)),
                        )
                      }
                      placeholder="Remark"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBands((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setBands((prev) => [...prev, { minScore: 0, maxScore: 0, grade: '' }])
                  }
                >
                  Add band
                </Button>
                <PermissionGate permission="assessment.grading-scale.update">
                  <Button
                    type="button"
                    disabled={!!bandError || save.isPending}
                    onClick={saveScale}
                  >
                    Save
                  </Button>
                </PermissionGate>
                <Button type="button" variant="outline" onClick={duplicateScale}>
                  Duplicate
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select or create a scale.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SchemesPage() {
  const schemes = useSchemes();
  const levels = useLevels();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = schemes.data?.find((s) => s.id === selectedId);
  const [name, setName] = useState('');
  const [levelId, setLevelId] = useState('');
  const [components, setComponents] = useState<
    Array<{ name: string; weight: number; maxScore: number; isExam?: boolean }>
  >([]);
  const weightTotal = components.reduce((s, c) => s + (Number(c.weight) || 0), 0);

  useEffect(() => {
    if (!selected) return;
    setName(selected.name);
    setLevelId(String(selected.levelId));
    setComponents(
      (selected.components ?? []).map((c) => ({
        name: c.name,
        weight: c.weight,
        maxScore: c.maxScore,
        isExam: c.isExam,
      })),
    );
  }, [selected]);

  const save = useSaveScheme();
  function saveScheme() {
    save.mutate(
      { id: selectedId, body: { name, levelId: Number(levelId), components } },
      {
        onSuccess: () => toastSuccess('Scheme saved'),
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assessment schemes"
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setName('New scheme');
              setLevelId(levels.data?.[0] ? String(levels.data[0].id) : '');
              setComponents([
                { name: 'CA1', weight: 20, maxScore: 20 },
                { name: 'CA2', weight: 20, maxScore: 20 },
                { name: 'Exam', weight: 60, maxScore: 60, isExam: true },
              ]);
            }}
          >
            New scheme
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
        <ul className="space-y-1 rounded-xl border border-border p-2">
          {(schemes.data ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedId === s.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedId(s.id)}
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-3 rounded-xl border border-border p-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <select
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
          >
            <option value="">Level…</option>
            {(levels.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <p className={`text-sm ${weightTotal === 100 ? 'text-green-700' : 'text-destructive'}`}>
            Weights total: {weightTotal} / 100
          </p>
          {components.map((c, i) => (
            <div key={i} className="grid grid-cols-4 gap-1">
              <Input
                value={c.name}
                onChange={(e) =>
                  setComponents((prev) =>
                    prev.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)),
                  )
                }
              />
              <Input
                type="number"
                value={c.weight}
                onChange={(e) =>
                  setComponents((prev) =>
                    prev.map((row, idx) =>
                      idx === i ? { ...row, weight: Number(e.target.value) } : row,
                    ),
                  )
                }
              />
              <Input
                type="number"
                value={c.maxScore}
                onChange={(e) =>
                  setComponents((prev) =>
                    prev.map((row, idx) =>
                      idx === i ? { ...row, maxScore: Number(e.target.value) } : row,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={!!c.isExam}
                  onChange={(e) =>
                    setComponents((prev) =>
                      prev.map((row, idx) => (idx === i ? { ...row, isExam: e.target.checked } : row)),
                    )
                  }
                />
                Exam
              </label>
            </div>
          ))}
          <Button
            type="button"
            disabled={weightTotal !== 100 || save.isPending}
            onClick={saveScheme}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowsPage() {
  const workflows = useWorkflows();
  const levels = useLevels();
  const roles = useRoles();
  const [levelId, setLevelId] = useState('');
  const [roleIds, setRoleIds] = useState<number[]>([]);

  useEffect(() => {
    const wf = workflows.data?.find((w) => String(w.levelId) === levelId);
    setRoleIds(wf?.approverRoleIds ?? []);
  }, [workflows.data, levelId]);

  const save = useSaveWorkflow();
  function saveWorkflow() {
    save.mutate(
      { levelId: Number(levelId), roleIds },
      {
        onSuccess: () => toastSuccess('Workflow saved'),
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Approval workflows" description="Ordered approver roles per level." />
      <select
        className="h-10 max-w-xs rounded-md border border-border bg-background px-2 text-sm"
        value={levelId}
        onChange={(e) => setLevelId(e.target.value)}
      >
        <option value="">Level…</option>
        {(levels.data ?? []).map((l) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>
      <ul className="space-y-2">
        {roleIds.map((id, index) => (
          <li key={`${id}-${index}`} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-muted-foreground">{index + 1}.</span>
            <select
              className="h-9 flex-1 rounded-md border border-border bg-background px-2"
              value={id}
              onChange={(e) =>
                setRoleIds((prev) =>
                  prev.map((r, i) => (i === index ? Number(e.target.value) : r)),
                )
              }
            >
              {(roles.data ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setRoleIds((prev) => prev.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={index === 0}
              onClick={() =>
                setRoleIds((prev) => {
                  const next = [...prev];
                  [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                  return next;
                })
              }
            >
              Up
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setRoleIds((prev) => [...prev, roles.data?.[0]?.id ?? 0])}
          disabled={!roles.data?.length}
        >
          Add step
        </Button>
        <PermissionGate permission="assessment.workflow.update">
          <Button type="button" disabled={!levelId || save.isPending} onClick={saveWorkflow}>
            Save
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
}

export function AssessmentsListPage() {
  const { campusQuery, density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const list = useAssessments({ page, status: status || undefined });
  const columns: DataTableColumn<Assessment>[] = [
    {
      id: 'title',
      header: 'Title',
      cell: (r) => (
        <Link className="text-primary hover:underline" href={`/admin/assessments/${r.id}`}>
          {r.title}
        </Link>
      ),
    },
    { id: 'class', header: 'Class', cell: (r) => r.className ?? r.classId },
    { id: 'subject', header: 'Subject', cell: (r) => r.subjectName ?? r.subjectId },
    {
      id: 'progress',
      header: 'Entered',
      cell: (r) =>
        r.enteredCount != null && r.classSize != null
          ? `${r.enteredCount}/${r.classSize}`
          : '—',
    },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Assessments" description={`Campus filter: ${campusQuery ?? 'all'}`} />
      <select
        className="h-10 rounded-md border border-border bg-background px-2 text-sm"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
      </select>
      <QueryState isPending={list.isPending} error={list.error} onRetry={() => void list.refetch()}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function ScoreSheetPage({ assessmentId }: { assessmentId: number }) {
  const assessment = useAssessment(assessmentId);
  const scoresQ = useScores(assessmentId);
  const [editScore, setEditScore] = useState<Score | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);

  const patch = usePatchLockedScore(assessmentId);
  function patchScore(reason: string, score: number) {
    patch.mutate(
      { scoreId: editScore!.id, score, reason },
      {
        onSuccess: () => {
          toastSuccess('Score updated');
          setReasonOpen(false);
          setEditScore(null);
        },
        onError: (e) => toastError('Could not edit', e.message),
      },
    );
  }

  const submit = useSubmitAssessment(assessmentId);
  function submitScores() {
    submit.mutate(undefined, {
      onSuccess: () => toastSuccess('Submitted'),
      onError: (e) => toastError('Could not submit', e.message),
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={assessment.data?.title ?? `Assessment #${assessmentId}`}
        description={assessment.data ? `Max ${assessment.data.maxScore ?? '—'} · ${assessment.data.status}` : undefined}
        actions={
          <PermissionGate permission="assessment.score.submit">
            {assessment.data?.status !== 'submitted' ? (
              <Button type="button" onClick={submitScores} disabled={submit.isPending}>
                Submit
              </Button>
            ) : null}
          </PermissionGate>
        }
      />
      <QueryState isPending={scoresQ.isPending} error={scoresQ.error} onRetry={() => void scoresQ.refetch()}>
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-2 py-2">Student</th>
              <th className="px-2 py-2">Score</th>
              <th className="px-2 py-2">Absent</th>
              <th className="px-2 py-2">Locked</th>
            </tr>
          </thead>
          <tbody>
            {(scoresQ.data ?? []).map((s) => (
              <tr key={s.id} className="border-b border-border/70">
                <td className="px-2 py-2">{s.studentName ?? s.studentId}</td>
                <td className="px-2 py-2">
                  {s.isLocked ? (
                    <PermissionGate permission="assessment.score.edit-locked">
                      <button
                        type="button"
                        className="font-mono text-primary hover:underline"
                        onClick={() => {
                          setEditScore(s);
                          setReasonOpen(true);
                        }}
                      >
                        {s.score ?? '—'}
                      </button>
                    </PermissionGate>
                  ) : (
                    <span className="font-mono">{s.score ?? '—'}</span>
                  )}
                </td>
                <td className="px-2 py-2">{s.isAbsent ? 'Yes' : 'No'}</td>
                <td className="px-2 py-2">{s.isLocked ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </QueryState>
      <ReasonDialog
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        title="Edit locked score"
        confirmLabel="Save"
        isPending={patch.isPending}
        onConfirm={(reason) => {
          const score = Number(window.prompt('New score', String(editScore?.score ?? 0)));
          if (!Number.isFinite(score)) return;
          patchScore(reason, score);
        }}
      />
    </div>
  );
}

export function ResultSheetsListPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const list = useResultSheets({ page, status: status || undefined });
  const columns: DataTableColumn<ResultSheet>[] = [
    {
      id: 'class',
      header: 'Class',
      cell: (r) => (
        <Link className="text-primary hover:underline" href={`/admin/result-sheets/${r.id}`}>
          {r.className ?? `Class ${r.classId}`}
        </Link>
      ),
    },
    { id: 'term', header: 'Term', cell: (r) => r.termId },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'computed', header: 'Computed', cell: (r) => r.computedAt ?? '—' },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Result sheets" />
      <select
        className="h-10 rounded-md border border-border bg-background px-2 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="draft">Draft</option>
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
        <option value="published">Published</option>
      </select>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function ResultSheetDetailPage({ sheetId }: { sheetId: number }) {
  const sheet = useResultSheet(sheetId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    published: number;
    withheld: number;
    withheldIds: number[];
  } | null>(null);
  const [jobMsg, setJobMsg] = useState<string | null>(null);

  const compute = useComputeResultSheet(sheetId);
  function computeNow() {
    compute.mutate(undefined, {
      onSuccess: () => {
        setJobMsg('Computing…');
        toastSuccess('Compute started');
      },
      onError: (e) => toastError('Compute failed', e.message),
    });
  }
  const approve = useApproveResultSheet(sheetId);
  function approveNow() {
    approve.mutate(undefined, {
      onSuccess: () => toastSuccess('Approved'),
      onError: (e) => toastError('Approve failed', e.message),
    });
  }
  const reject = useRejectResultSheet(sheetId);
  function rejectNow(reason: string) {
    reject.mutate(reason, {
      onSuccess: () => {
        toastSuccess('Rejected');
        setRejectOpen(false);
      },
      onError: (e) => toastError('Reject failed', e.message),
    });
  }
  const publish = usePublishResultSheet(sheetId);
  function publishNow() {
    publish.mutate(undefined, {
      onSuccess: (data) => {
        const rec = asRecord(data);
        const withheldIds = Array.isArray(rec?.withheldStudentIds)
          ? (rec!.withheldStudentIds as number[])
          : [];
        setPublishResult({
          published: Number(rec?.publishedCount ?? 0),
          withheld: Number(rec?.withheldCount ?? withheldIds.length),
          withheldIds,
        });
        toastSuccess('Published');
      },
      onError: (e) => toastError('Publish failed', e.message),
    });
  }

  const status = sheet.data?.status ?? '';

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Result sheet #${sheetId}`}
        description={sheet.data ? `Class ${sheet.data.classId} · Term ${sheet.data.termId}` : undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={status} />
            <PermissionGate permission="assessment.result-sheet.compute">
              <Button type="button" variant="outline" onClick={computeNow}>
                Compute
              </Button>
            </PermissionGate>
            <PermissionGate permission="assessment.result.approve">
              <Button type="button" variant="outline" onClick={approveNow}>
                Approve
              </Button>
              <Button type="button" variant="outline" onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
            </PermissionGate>
            <PermissionGate permission="assessment.result.publish">
              <Button type="button" onClick={publishNow} disabled={status !== 'approved'}>
                Publish
              </Button>
            </PermissionGate>
          </div>
        }
      />
      {jobMsg ? <AsyncJobBanner status="running" message={jobMsg} /> : null}
      <QueryState isPending={sheet.isPending} error={sheet.error} onRetry={() => void sheet.refetch()}>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="px-3 py-2">Student</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Average</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {(sheet.data?.students ?? []).map((row, i) => {
                const r = asRecord(row) ?? {};
                const id = Number(r.studentId ?? i);
                const withheld = sheet.data?.withheldStudentIds?.includes(id);
                return (
                  <tr key={id} className="border-b border-border/70">
                    <td className="px-3 py-2">
                      {withheld ? '🔒 ' : ''}
                      {str(r.studentName) || id}
                    </td>
                    <td className="px-3 py-2">{str(r.total) || '—'}</td>
                    <td className="px-3 py-2">{str(r.average) || '—'}</td>
                    <td className="px-3 py-2">{str(r.position) || '—'}</td>
                    <td className="px-3 py-2">{str(r.grade) || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </QueryState>
      <ReasonDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject result sheet"
        confirmLabel="Reject"
        destructive
        isPending={reject.isPending}
        onConfirm={rejectNow}
      />
      <ConfirmDialog
        open={publishResult != null}
        onOpenChange={(o) => !o && setPublishResult(null)}
        title="Publish complete"
        description={
          publishResult
            ? `${publishResult.published} published, ${publishResult.withheld} withheld by fee clearance.`
            : undefined
        }
        confirmLabel="OK"
        onConfirm={() => setPublishResult(null)}
      >
        {publishResult?.withheldIds.length ? (
          <ul className="text-sm">
            {publishResult.withheldIds.map((id) => (
              <li key={id}>
                <Link className="text-primary hover:underline" href={`/admin/students/${id}/fees`}>
                  Student {id} fees
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

export function ReportCardsPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<ReportCard | null>(null);
  const list = useReportCards({ page });
  const detail = useReportCard(preview?.id ?? null);
  const regenerate = useRegenerateReportCard();
  function regenerateCard(id: number) {
    regenerate.mutate(id, {
      onSuccess: () => toastSuccess('Regenerate started'),
      onError: (e) => toastError('Failed', e.message),
    });
  }

  const columns: DataTableColumn<ReportCard>[] = [
    { id: 'student', header: 'Student', cell: (r) => r.studentName ?? r.studentId },
    { id: 'class', header: 'Class', cell: (r) => r.classId ?? '—' },
    { id: 'state', header: 'State', cell: (r) => <StatusBadge status={r.state ?? r.status ?? 'generated'} /> },
    { id: 'generated', header: 'Generated', cell: (r) => r.generatedAt ?? '—' },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => setPreview(r)}>
            View PDF
          </Button>
          <Button size="sm" variant="ghost" onClick={() => regenerateCard(r.id)}>
            Regenerate
          </Button>
        </div>
      ),
    },
  ];

  const pdfUrl = detail.data?.pdfUrl ?? detail.data?.signedUrl;

  return (
    <div className="space-y-5">
      <PageHeader title="Report cards" />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
      <Sheet open={preview != null} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Report card preview</SheetTitle>
          </SheetHeader>
          {pdfUrl ? (
            <iframe title="Report card" src={pdfUrl} className="mt-4 h-[70vh] w-full rounded-lg border" />
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No signed PDF URL yet.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ReportTemplatesPage() {
  const templates = useDocumentTemplates('report-card');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const detail = useDocumentTemplate(selectedId);
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!detail.data) return;
    setName(detail.data.name);
    setHtml(detail.data.html ?? '');
    setCss(detail.data.css ?? '');
  }, [detail.data]);

  const save = useSaveDocumentTemplate('report-card');
  function saveTemplate() {
    save.mutate(
      { id: selectedId, body: { name, html, css } },
      {
        onSuccess: (row) => {
          toastSuccess('Template saved');
          setSelectedId(row.id);
        },
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  }

  const preview = usePreviewDocumentTemplate();
  function previewPdf() {
    preview.mutate(
      { id: selectedId!, data: { studentName: 'Sample Student' } },
      {
        onSuccess: (data) => {
          const rec = asRecord(data);
          const url = str(rec?.url) || str(rec?.pdfUrl) || str(rec?.signedUrl);
          setPreviewUrl(url || null);
          toastSuccess('Preview ready');
        },
        onError: (e) => toastError('Preview failed', e.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Report card templates"
        actions={
          <Button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setName('New template');
              setHtml('<h1>{{studentName}}</h1>');
              setCss('h1{font-family:serif}');
            }}
          >
            New
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[12rem_1fr_1fr]">
        <ul className="space-y-1 rounded-xl border border-border p-2">
          {(templates.data ?? []).map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedId === t.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
                onClick={() => setSelectedId(t.id)}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Label>HTML</Label>
          <textarea
            className="min-h-[200px] w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
          <Label>CSS</Label>
          <textarea
            className="min-h-[100px] w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
            value={css}
            onChange={(e) => setCss(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" disabled={save.isPending} onClick={saveTemplate}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedId || preview.isPending}
              onClick={previewPdf}
            >
              Preview PDF
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-border p-2">
          {previewUrl ? (
            <iframe title="Template preview" src={previewUrl} className="h-[420px] w-full" />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Preview appears here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
