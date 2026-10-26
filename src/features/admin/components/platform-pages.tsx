'use client';

import { useEffect, useState } from 'react';
import { AsyncJobBanner } from '@/components/patterns/async-job-banner';
import { ReasonDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterBar } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { SignedFileLink } from '@/components/patterns/signed-file-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { asRecord, str } from '@/lib/utils/record';
import type { DocumentTemplate } from '../api/assessment';
import type { AuditLog, FeatureFlag, ReportDefinition, ReportSchedule } from '../api/platform';
import {
  useAuditLog,
  useAuditLogs,
  useCreateErasureRequest,
  useCreateExport,
  useCreateReportSchedule,
  useDeleteReportSchedule,
  useDocumentTemplate,
  useDocumentTemplates,
  useEnqueueReportRun,
  useExportAuditLogs,
  useFeatureFlags,
  usePreviewDocumentTemplate,
  useReportCatalogue,
  useReportRun,
  useReportSchedules,
  useSaveDocumentTemplate,
  useSaveSettingsGroup,
  useSettingsGroup,
  useUpdateFeatureFlag,
} from '../hooks/use-platform';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import { ImportWizard } from './import-wizard';

const SETTINGS_GROUPS = [
  'fee-clearance',
  'reminders',
  'attendance',
  'student-id',
  'security-policy',
  'notifications',
  'admissions',
] as const;

function asList<T>(data: T[] | { data?: T[] } | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.data ?? [];
}

export function AuditLogPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const list = useAuditLogs({ page, action, targetType });
  const detail = useAuditLog(selectedId);
  const exportLogs = useExportAuditLogs();
  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: 'when',
      header: 'When',
      cell: (r) => (
        <button type="button" className="text-left text-primary hover:underline" onClick={() => setSelectedId(r.id)}>
          {r.createdAt ?? r.id}
        </button>
      ),
    },
    { id: 'actor', header: 'Actor', cell: (r) => r.actorName ?? r.actorUserId ?? '—' },
    { id: 'action', header: 'Action', cell: (r) => r.action ?? '—' },
    { id: 'target', header: 'Target', cell: (r) => `${r.targetType ?? ''} ${r.targetId ?? ''}` },
    { id: 'summary', header: 'Summary', cell: (r) => r.summary ?? '—' },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        actions={
          <PermissionGate permission="audit.log.export">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                exportLogs.mutate(
                  { action: action || undefined, targetType: targetType || undefined },
                  {
                    onSuccess: () => toastSuccess('Export queued'),
                    onError: (e) => toastError('Export failed', e.message),
                  },
                )
              }
            >
              Export
            </Button>
          </PermissionGate>
        }
      />
      <FilterBar>
        <Input
          className="max-w-[10rem]"
          placeholder="Action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        />
        <Input
          className="max-w-[10rem]"
          placeholder="Target type"
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
      {selectedId != null && detail.data ? (
        <div className="grid gap-3 rounded-xl border border-border p-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Before</h3>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-xs">
              {JSON.stringify(detail.data.before ?? null, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">After</h3>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-xs">
              {JSON.stringify(detail.data.after ?? null, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SettingsGroupsPage() {
  const [group, setGroup] = useState<(typeof SETTINGS_GROUPS)[number]>('fee-clearance');
  const [json, setJson] = useState('{}');
  const settings = useSettingsGroup(group);

  useEffect(() => {
    if (settings.data?.value) setJson(JSON.stringify(settings.data.value, null, 2));
  }, [settings.data]);

  const save = useSaveSettingsGroup(group);

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Edit configuration groups as JSON. Fee clearance also has a dedicated UI." />
      <div className="flex flex-wrap gap-2">
        {SETTINGS_GROUPS.map((g) => (
          <Button
            key={g}
            size="sm"
            type="button"
            variant={group === g ? 'default' : 'outline'}
            onClick={() => setGroup(g)}
          >
            {g}
          </Button>
        ))}
      </div>
      <QueryState isPending={settings.isPending} error={settings.error}>
        <textarea
          className="min-h-[280px] w-full rounded-xl border border-border bg-background p-3 font-mono text-xs"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <PermissionGate permission="config.setting.write">
          <Button
            type="button"
            disabled={save.isPending}
            onClick={() => {
              let value: Record<string, unknown>;
              try {
                value = JSON.parse(json || '{}') as Record<string, unknown>;
              } catch {
                toastError('Invalid JSON');
                return;
              }
              save.mutate(value, {
                onSuccess: () => toastSuccess('Settings saved'),
                onError: (e) => toastError('Save failed', e.message),
              });
            }}
          >
            Save {group}
          </Button>
        </PermissionGate>
      </QueryState>
    </div>
  );
}

export function FeatureModulesPage() {
  const flags = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();
  const rows = asList<FeatureFlag>(flags.data as FeatureFlag[] | { data?: FeatureFlag[] });
  return (
    <div className="space-y-5">
      <PageHeader title="Feature modules" description="Licence badges reflect whether the flag is entitled." />
      <QueryState isPending={flags.isPending} error={flags.error}>
        <ul className="space-y-2">
          {rows.map((f) => (
            <li
              key={f.key}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
            >
              <div>
                <div className="font-medium">{f.label ?? f.key}</div>
                <div className="text-xs text-muted-foreground">{f.key}</div>
              </div>
              <div className="flex items-center gap-2">
                {f.licensed === false ? (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Unlicensed</span>
                ) : (
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">Licensed</span>
                )}
                <PermissionGate permission="config.flag.write">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={f.licensed === false}
                    onClick={() =>
                      updateFlag.mutate(
                        { key: f.key, enabled: !f.enabled },
                        {
                          onSuccess: () => toastSuccess('Updated'),
                          onError: (e) => toastError('Failed', e.message),
                        },
                      )
                    }
                  >
                    {f.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </PermissionGate>
              </div>
            </li>
          ))}
        </ul>
      </QueryState>
    </div>
  );
}

export function DocumentTemplatesPage() {
  const [typeCode, setTypeCode] = useState('receipt');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const templates = useDocumentTemplates(typeCode);
  const detail = useDocumentTemplate(selectedId);

  useEffect(() => {
    if (!detail.data) return;
    setName(detail.data.name);
    setHtml(detail.data.html ?? '');
    setCss(detail.data.css ?? '');
  }, [detail.data]);

  const saveMutation = useSaveDocumentTemplate(typeCode);
  const previewMutation = usePreviewDocumentTemplate();
  const save = {
    isPending: saveMutation.isPending,
    mutate: () =>
      saveMutation.mutate(
        { id: selectedId, name, html, css },
        {
          onSuccess: (row: DocumentTemplate) => {
            toastSuccess('Saved');
            setSelectedId(row.id);
          },
          onError: (e) => toastError('Save failed', e.message),
        },
      ),
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Document templates"
        actions={
          <SegmentedControl
            aria-label="Template type"
            value={typeCode}
            onValueChange={(v) => {
              setTypeCode(v);
              setSelectedId(null);
              setName('');
              setHtml('');
              setCss('');
              setPreviewUrl(null);
            }}
            options={[
              { value: 'receipt', label: 'Receipt' },
              { value: 'id-card', label: 'ID card' },
              { value: 'letter', label: 'Letter' },
            ]}
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-[12rem_1fr_1fr]">
        <ul className="space-y-1 rounded-xl border border-border p-2">
          <li>
            <Button
              size="sm"
              className="mb-2 w-full"
              variant="outline"
              onClick={() => {
                setSelectedId(null);
                setName(`New ${typeCode}`);
                setHtml('<p>{{content}}</p>');
                setCss('p{font-family:serif}');
              }}
            >
              New
            </Button>
          </li>
          {(templates.data ?? []).map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  selectedId === t.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setSelectedId(t.id);
                  setName(t.name);
                  setHtml(t.html ?? '');
                  setCss(t.css ?? '');
                }}
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
            <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedId}
              onClick={() =>
                previewMutation.mutate(
                  { id: selectedId!, data: { studentName: 'Sample' } },
                  {
                    onSuccess: (data) => {
                      const rec = asRecord(data);
                      setPreviewUrl(str(rec?.url) || str(rec?.pdfUrl) || str(rec?.signedUrl) || null);
                    },
                    onError: (e) => toastError('Preview failed', e.message),
                  },
                )
              }
            >
              Preview PDF
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-border p-2">
          {previewUrl ? (
            <iframe title="Preview" src={previewUrl} className="h-[420px] w-full" />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Preview appears here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const [runId, setRunId] = useState<number | null>(null);
  const [cron, setCron] = useState('0 8 * * 1');
  const [scheduleKey, setScheduleKey] = useState('');
  const catalogue = useReportCatalogue();
  const schedules = useReportSchedules();
  const run = useReportRun(runId);
  const enqueue = useEnqueueReportRun();
  const createSchedule = useCreateReportSchedule();
  const deleteSchedule = useDeleteReportSchedule();
  const defs = asList<ReportDefinition>(catalogue.data as ReportDefinition[] | { data?: ReportDefinition[] });
  const scheduleRows = asList<ReportSchedule>(
    schedules.data as ReportSchedule[] | { data?: ReportSchedule[] },
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" />
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Catalogue</h2>
        <QueryState isPending={catalogue.isPending} error={catalogue.error}>
          <ul className="space-y-2">
            {defs.map((d) => (
              <li key={d.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.description ?? d.key}</div>
                </div>
                <PermissionGate permission="reporting.report.run">
                  <Button
                    size="sm"
                    onClick={() =>
                      enqueue.mutate(
                        { definitionKey: d.key },
                        {
                          onSuccess: (r) => {
                            setRunId(r.id);
                            toastSuccess('Run queued');
                          },
                          onError: (e) => toastError('Failed', e.message),
                        },
                      )
                    }
                  >
                    Run
                  </Button>
                </PermissionGate>
              </li>
            ))}
          </ul>
        </QueryState>
        {runId != null ? (
          <div className="space-y-2">
            <AsyncJobBanner
              status={run.data?.status ?? 'queued'}
              message={`Report run #${runId}`}
            />
            {run.data?.downloadUrl ? (
              <SignedFileLink href={run.data.downloadUrl}>Download result</SignedFileLink>
            ) : null}
          </div>
        ) : null}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Schedules</h2>
        <PermissionGate permission="reporting.schedule.create">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-xs"
              placeholder="Definition key"
              value={scheduleKey}
              onChange={(e) => setScheduleKey(e.target.value)}
            />
            <Input className="max-w-xs" value={cron} onChange={(e) => setCron(e.target.value)} />
            <Button
              type="button"
              disabled={!scheduleKey}
              onClick={() =>
                createSchedule.mutate(
                  { definitionKey: scheduleKey, cron },
                  {
                    onSuccess: () => {
                      toastSuccess('Schedule created');
                      setScheduleKey('');
                    },
                    onError: (e) => toastError('Failed', e.message),
                  },
                )
              }
            >
              Add schedule
            </Button>
          </div>
        </PermissionGate>
        <ul className="space-y-2">
          {scheduleRows.map((s) => (
            <li key={s.id} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>
                {s.definitionKey} · {s.cron ?? '—'} · {s.isActive ? 'active' : 'off'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  deleteSchedule.mutate(s.id, {
                    onSuccess: () => toastSuccess('Deleted'),
                    onError: (e) => toastError('Failed', e.message),
                  })
                }
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function DataJobsPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [exportEntity, setExportEntity] = useState('students');
  const [jobId, setJobId] = useState<number | null>(null);
  const exportJob = useCreateExport();
  return (
    <div className="space-y-5">
      <PageHeader
        title="Imports & exports"
        description="Start jobs here. Queue health is under /it."
        actions={
          <div className="flex gap-2">
            <PermissionGate permission="import-export.import.create">
              <Button type="button" onClick={() => setImportOpen(true)}>
                Import
              </Button>
            </PermissionGate>
            <PermissionGate permission="import-export.export.create">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  exportJob.mutate(
                    { entity: exportEntity },
                    {
                      onSuccess: (data) => {
                        const rec = asRecord(data);
                        const id = Number(rec?.id);
                        if (Number.isFinite(id)) setJobId(id);
                        toastSuccess('Export queued');
                      },
                      onError: (e) => toastError('Failed', e.message),
                    },
                  )
                }
              >
                Export
              </Button>
            </PermissionGate>
          </div>
        }
      />
      <div className="flex gap-2">
        <Label className="self-center text-sm">Export entity</Label>
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={exportEntity}
          onChange={(e) => setExportEntity(e.target.value)}
        >
          <option value="students">Students</option>
          <option value="staff">Staff</option>
          <option value="invoices">Invoices</option>
          <option value="payments">Payments</option>
        </select>
      </div>
      {jobId != null ? <AsyncJobBanner status="queued" message={`Export job #${jobId}`} /> : null}
      <ImportWizard open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

export function DataProtectionPage() {
  const [studentId, setStudentId] = useState('');
  const [erasureOpen, setErasureOpen] = useState(false);
  const erasure = useCreateErasureRequest();
  return (
    <div className="space-y-5">
      <PageHeader
        title="Data protection"
        description="NDPA erasure and consent tools. Process only with a recorded reason."
      />
      <div className="grid max-w-md gap-3 rounded-xl border border-border p-4">
        <div className="grid gap-1.5">
          <Label>Student ID</Label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </div>
        <PermissionGate permission="students.erasure.create">
          <Button type="button" variant="danger" disabled={!studentId} onClick={() => setErasureOpen(true)}>
            Request erasure
          </Button>
        </PermissionGate>
        <p className="text-xs text-muted-foreground">
          Consent register lives on the student profile Consents tab. Retention follows school policy settings.
        </p>
      </div>
      <ReasonDialog
        open={erasureOpen}
        onOpenChange={setErasureOpen}
        title="Process erasure request"
        description="Provide a lawful basis / reason. This action is audited."
        confirmLabel="Submit request"
        onConfirm={async (reason) => {
          try {
            await erasure.mutateAsync({ studentId: Number(studentId), reason });
            toastSuccess('Erasure request submitted');
            setErasureOpen(false);
          } catch (e) {
            toastError('Failed', e instanceof Error ? e.message : undefined);
          }
        }}
      />
    </div>
  );
}
