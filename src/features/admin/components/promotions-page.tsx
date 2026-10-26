'use client';

import { useState } from 'react';
import { AsyncJobBanner } from '@/components/patterns/async-job-banner';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { asRecord, str } from '@/lib/utils/record';

function optNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
import {
  useExecutePromotion,
  usePreviewPromotion,
  usePromotion,
  useReversePromotion,
} from '../hooks/use-promotions';
import { useCampuses, useClasses, useSessions } from '../hooks/use-structure';
import { PROMOTION_OUTCOMES } from '../lib/codes';
import { useAdminCampus } from '../lib/campus';

type PreviewRow = {
  studentId: number;
  studentName?: string;
  currentClassId?: number;
  outcomeCode: string;
  destinationClassId?: number | null;
};

export function PromotionsWizard({ promotionId }: { promotionId?: number }) {
  const { campusQuery } = useAdminCampus();
  const [step, setStep] = useState(promotionId ? 4 : 1);
  const [campusId, setCampusId] = useState(campusQuery ?? '');
  const [fromSessionId, setFromSessionId] = useState('');
  const [toSessionId, setToSessionId] = useState('');
  const [batchId, setBatchId] = useState<string | number | null>(null);
  const [jobId, setJobId] = useState<number | null>(promotionId ?? null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [reverseOpen, setReverseOpen] = useState(false);

  const classesCampusId = campusId || campusQuery;
  const campuses = useCampuses();
  const sessions = useSessions(campusQuery);
  const classes = useClasses({ campusId: classesCampusId || undefined, key: classesCampusId });
  const job = usePromotion(jobId);
  const preview = usePreviewPromotion();
  const execute = useExecutePromotion();
  const reverse = useReversePromotion(jobId);

  const scope = {
    campusId: Number(campusId),
    fromSessionId: Number(fromSessionId),
    toSessionId: Number(toSessionId),
  };

  const runPreview = () =>
    preview.mutate(scope, {
      onSuccess: (data) => {
        const rec = asRecord(data);
        setBatchId(str(rec?.batchId) || optNum(rec?.batchId) || null);
        const list = Array.isArray(rec?.students)
          ? rec!.students
          : Array.isArray(rec?.rows)
            ? rec!.rows
            : Array.isArray(data)
              ? data
              : [];
        setRows(
          list.map((item) => {
            const r = asRecord(item) ?? {};
            return {
              studentId: optNum(r.studentId) ?? 0,
              studentName: str(r.studentName) || str(r.name) || undefined,
              currentClassId: optNum(r.currentClassId) ?? undefined,
              outcomeCode: str(r.outcomeCode) || 'promoted',
              destinationClassId: optNum(r.destinationClassId),
            };
          }),
        );
        setStep(2);
        toastSuccess('Preview ready');
        if (rec?.warnings) {
          toastError('Warning', 'Term may not be closed or results unpublished — you can still continue.');
        }
      },
      onError: (e) => toastError('Preview failed', e.message),
    });

  const runExecute = () =>
    execute.mutate(
      {
        ...scope,
        batchId,
        decisions: rows.map((r) => ({
          studentId: r.studentId,
          outcomeCode: r.outcomeCode,
          destinationClassId: r.destinationClassId ?? undefined,
        })),
      },
      {
        onSuccess: (data) => {
          const id = optNum(asRecord(data)?.id) ?? optNum(asRecord(data)?.promotionId);
          if (id != null) setJobId(id);
          setStep(4);
          toastSuccess('Promotion started');
        },
        onError: (e) => toastError('Could not execute', e.message),
      },
    );

  const runReverse = (reason: string) =>
    reverse.mutate(reason, {
      onSuccess: () => {
        toastSuccess('Promotion reversed');
        setReverseOpen(false);
      },
      onError: (e) => toastError('Could not reverse', e.message),
    });

  const jobStatus = str(asRecord(job.data)?.status) || 'queued';

  return (
    <div className="space-y-5">
      <PageHeader
        title="Promotions"
        description="Move students to the next session. Warns if the term is open or results unpublished."
      />
      {step === 1 ? (
        <div className="grid max-w-lg gap-3 rounded-xl border border-border bg-card p-4">
          <Field label="Campus">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
            >
              <option value="">Select…</option>
              {(campuses.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="From session">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={fromSessionId}
              onChange={(e) => setFromSessionId(e.target.value)}
            >
              <option value="">Select…</option>
              {(sessions.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="To session">
            <select
              className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={toSessionId}
              onChange={(e) => setToSessionId(e.target.value)}
            >
              <option value="">Select…</option>
              {(sessions.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            disabled={!campusId || !fromSessionId || !toSessionId || preview.isPending}
            onClick={runPreview}
          >
            {preview.isPending ? 'Loading…' : 'Preview'}
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Destination class</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId} className="border-b border-border/70">
                    <td className="px-3 py-2">{r.studentName ?? r.studentId}</td>
                    <td className="px-3 py-2">
                      <select
                        className="h-9 rounded-md border border-border bg-background px-2"
                        value={r.outcomeCode}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((row) =>
                              row.studentId === r.studentId
                                ? { ...row, outcomeCode: e.target.value }
                                : row,
                            ),
                          )
                        }
                      >
                        {PROMOTION_OUTCOMES.map((o) => (
                          <option key={o.code} value={o.code}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="h-9 rounded-md border border-border bg-background px-2"
                        value={r.destinationClassId ?? ''}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((row) =>
                              row.studentId === r.studentId
                                ? {
                                    ...row,
                                    destinationClassId: e.target.value ? Number(e.target.value) : null,
                                  }
                                : row,
                            ),
                          )
                        }
                      >
                        <option value="">—</option>
                        {(classes.data ?? []).map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" onClick={() => setStep(3)}>Continue</Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm">
            Promote <strong>{rows.filter((r) => r.outcomeCode === 'promoted').length}</strong>, repeat{' '}
            <strong>{rows.filter((r) => r.outcomeCode === 'repeated').length}</strong>, graduate{' '}
            <strong>{rows.filter((r) => r.outcomeCode === 'graduated').length}</strong>, withdraw{' '}
            <strong>{rows.filter((r) => r.outcomeCode === 'withdrawn').length}</strong>.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button type="button" disabled={execute.isPending} onClick={runExecute}>
              {execute.isPending ? 'Starting…' : 'Confirm promotion'}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 4 && jobId != null ? (
        <div className="space-y-3">
          <AsyncJobBanner status={jobStatus} message={`Promotion #${jobId}`} />
          {jobStatus === 'completed' ? (
            <Button type="button" variant="outline" onClick={() => setReverseOpen(true)}>
              Reverse promotion
            </Button>
          ) : null}
        </div>
      ) : null}

      <ReasonDialog
        open={reverseOpen}
        onOpenChange={setReverseOpen}
        title="Reverse promotion?"
        confirmLabel="Reverse"
        destructive
        isPending={reverse.isPending}
        onConfirm={runReverse}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
