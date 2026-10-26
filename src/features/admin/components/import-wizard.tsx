'use client';

import { useEffect, useState } from 'react';
import { AsyncJobBanner } from '@/components/patterns/async-job-banner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import type { ImportEntity, ImportError } from '../api/imports';
import {
  useCancelImport,
  useCommitImport,
  useImportErrors,
  useImportJob,
  useUploadImport,
} from '../hooks/use-imports';

const ENTITIES: Array<{ value: ImportEntity; label: string }> = [
  { value: 'students', label: 'Students' },
  { value: 'guardians', label: 'Guardians' },
  { value: 'staff', label: 'Staff' },
  { value: 'scores', label: 'Scores' },
  { value: 'fee-structures', label: 'Fee structures' },
  { value: 'opening-balances', label: 'Opening balances' },
];

export function ImportWizard({
  open,
  onOpenChange,
  defaultEntity = 'students',
  allowedEntities,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEntity?: ImportEntity;
  allowedEntities?: ImportEntity[];
}) {
  const entities = ENTITIES.filter((e) => !allowedEntities || allowedEntities.includes(e.value));
  const [entity, setEntity] = useState<ImportEntity>(defaultEntity);
  const [step, setStep] = useState(1);
  const [jobId, setJobId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setEntity(defaultEntity);
      setStep(1);
      setJobId(null);
      setFile(null);
    }
  }, [open, defaultEntity]);

  const job = useImportJob(jobId);
  const errors = useImportErrors(jobId, step >= 3);
  const uploadMutation = useUploadImport();
  const commitMutation = useCommitImport(jobId);
  const cancelMutation = useCancelImport(jobId);

  const upload = {
    isPending: uploadMutation.isPending,
    mutate: () =>
      uploadMutation.mutate(
        { entity, file: file! },
        {
          onSuccess: (data) => {
            setJobId(data.id);
            setStep(3);
            toastSuccess('Dry run started');
          },
          onError: (e) => toastError('Upload failed', e.message),
        },
      ),
  };

  const commit = {
    isPending: commitMutation.isPending,
    mutate: () =>
      commitMutation.mutate(undefined, {
        onSuccess: () => {
          setStep(4);
          toastSuccess('Import committed');
        },
        onError: (e) => toastError('Commit failed', e.message),
      }),
  };

  const cancel = {
    isPending: cancelMutation.isPending,
    mutate: () =>
      cancelMutation.mutate(undefined, {
        onSuccess: () => {
          toastSuccess('Import cancelled');
          onOpenChange(false);
        },
        onError: (e) => toastError('Cancel failed', e.message),
      }),
  };

  const valid = job.data?.validRows ?? 0;
  const errorCount = job.data?.errorRows ?? errors.data?.length ?? 0;
  const canCommit =
    jobId != null &&
    step >= 3 &&
    (job.data?.status === 'validated' || job.data?.status === 'ready' || valid > 0) &&
    errorCount === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import wizard</DialogTitle>
          <DialogDescription>
            Template → dry-run validation → commit. Commit stays disabled until a clean dry run.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Entity</Label>
              <select
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                value={entity}
                onChange={(e) => setEntity(e.target.value as ImportEntity)}
              >
                {entities.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Download the CSV template from{' '}
              <code className="rounded bg-muted px-1">GET /import-templates/{entity}</code> then
              upload on the next step.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  window.open(`/api/proxy/import-templates/${entity}`, '_blank');
                }}
              >
                Download template
              </Button>
              <Button type="button" onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3">
            <Label>Upload CSV</Label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={!file || upload.isPending}
                onClick={() => upload.mutate()}
              >
                {upload.isPending ? 'Uploading…' : 'Dry run'}
              </Button>
            </div>
          </div>
        ) : null}

        {step >= 3 && jobId != null ? (
          <div className="space-y-3">
            <AsyncJobBanner
              status={job.data?.status ?? 'queued'}
              message={`Import #${jobId}`}
              progressLabel={
                job.data
                  ? `${job.data.validRows ?? 0} valid · ${job.data.errorRows ?? 0} errors`
                  : undefined
              }
            />
            <ErrorTable rows={errors.data ?? []} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Re-upload
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canCommit || commit.isPending}
                onClick={() => commit.mutate()}
              >
                {commit.isPending
                  ? 'Committing…'
                  : `Commit ${valid} row${valid === 1 ? '' : 's'}`}
              </Button>
            </div>
            {step === 4 ? (
              <p className="text-sm text-muted-foreground">Import finished. You can close this dialog.</p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ErrorTable({ rows }: { rows: ImportError[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No validation errors.</p>;
  }
  return (
    <div className="max-h-48 overflow-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-2 py-1">Row</th>
            <th className="px-2 py-1">Column</th>
            <th className="px-2 py-1">Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((r, i) => (
            <tr key={i} className="border-b border-border/60">
              <td className="px-2 py-1">{r.row}</td>
              <td className="px-2 py-1">{r.column ?? '—'}</td>
              <td className="px-2 py-1">{r.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
