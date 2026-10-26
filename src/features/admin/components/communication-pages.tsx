'use client';

import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { FilterBar } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { asRecord, str } from '@/lib/utils/record';
import type {
  Announcement,
  Delivery,
  NotificationTemplate,
  Reminder,
  SchoolEvent,
} from '../api/communication';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useCreateEvent,
  useCreateNotificationTemplate,
  useCreateReminder,
  useCreateThread,
  useDeleteAnnouncement,
  useDeliveries,
  useEvents,
  useNotificationTemplates,
  usePreviewNotificationTemplate,
  usePublishAnnouncement,
  useReminders,
  useRetryDelivery,
  useSendMessage,
  useThread,
  useThreads,
  useToggleReminder,
} from '../hooks/use-communication';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';

export function AnnouncementsPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('parents');
  const list = useAnnouncements(page);
  const create = useCreateAnnouncement();
  const publish = usePublishAnnouncement();
  const remove = useDeleteAnnouncement();
  const saveDraft = () =>
    create.mutate(
      { title, body, audience },
      {
        onSuccess: () => {
          toastSuccess('Draft saved');
          setTitle('');
          setBody('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<Announcement>[] = [
    { id: 'title', header: 'Title', cell: (r) => r.title },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'estimate',
      header: 'Est. recipients',
      cell: (r) => r.deliveryEstimate ?? '—',
    },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <div className="flex gap-2">
          <PermissionGate permission="communication.announcement.publish">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                publish.mutate(r.id, {
                  onSuccess: () => toastSuccess('Published'),
                  onError: (e) => toastError('Publish failed', e.message),
                })
              }
            >
              Publish
            </Button>
          </PermissionGate>
          <PermissionGate permission="communication.announcement.delete">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                remove.mutate(r.id, {
                  onSuccess: () => toastSuccess('Deleted'),
                  onError: (e) => toastError('Delete failed', e.message),
                })
              }
            >
              Delete
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Announcements" />
      <PermissionGate permission="communication.announcement.create">
        <div className="grid max-w-xl gap-2 rounded-xl border border-border p-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            className="min-h-[80px] rounded-md border border-border bg-background p-2 text-sm"
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-muted-foreground">Audience</Label>
            <select
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="parents">Parents</option>
              <option value="staff">Staff</option>
              <option value="students">Students</option>
              <option value="all">All</option>
            </select>
            <Button type="button" disabled={!title || create.isPending} onClick={saveDraft}>
              Save draft
            </Button>
          </div>
        </div>
      </PermissionGate>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function MessagesPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [reply, setReply] = useState('');
  const threads = useThreads(page);
  const thread = useThread(selectedId);
  const create = useCreateThread();
  const send = useSendMessage(selectedId);
  const createThread = () =>
    create.mutate(
      { subject: composeSubject, body: composeBody },
      {
        onSuccess: (data) => {
          toastSuccess('Thread created');
          setComposeSubject('');
          setComposeBody('');
          const rec = asRecord(data);
          const id = Number(rec?.id);
          if (Number.isFinite(id)) setSelectedId(id);
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const sendReply = () =>
    send.mutate(reply, {
      onSuccess: () => {
        toastSuccess('Sent');
        setReply('');
      },
      onError: (e) => toastError('Failed', e.message),
    });
  const messages = useMemo(() => {
    const rec = asRecord(thread.data);
    const raw = rec?.messages;
    return Array.isArray(raw) ? raw : [];
  }, [thread.data]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Messages"
        description="Recipient picker awaits backend gap 5 — compose with subject/body for now."
      />
      <div className="grid min-h-[420px] gap-3 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-2 rounded-xl border border-border p-2">
          <PermissionGate permission="communication.message.create">
            <div className="space-y-2 border-b border-border pb-2">
              <Input
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
              <textarea
                className="min-h-[60px] w-full rounded-md border border-border bg-background p-2 text-sm"
                placeholder="First message"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
              />
              <Button
                size="sm"
                type="button"
                disabled={!composeSubject || create.isPending}
                onClick={createThread}
              >
                New thread
              </Button>
            </div>
          </PermissionGate>
          <QueryState isPending={threads.isPending} error={threads.error}>
            <ul className="space-y-1">
              {(threads.data?.data ?? []).map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`w-full rounded-md px-2 py-2 text-left text-sm ${
                      selectedId === t.id ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <div>{t.subject ?? `Thread ${t.id}`}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.lastMessage ?? ''}</div>
                  </button>
                </li>
              ))}
            </ul>
          </QueryState>
        </div>
        <div className="flex flex-col rounded-xl border border-border p-3">
          {selectedId == null ? (
            <p className="text-sm text-muted-foreground">Select a thread</p>
          ) : (
            <>
              <div className="flex-1 space-y-2 overflow-auto">
                {messages.map((m, i) => {
                  const rec = asRecord(m);
                  return (
                    <div key={i} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                      {str(rec?.body) || str(rec?.content) || '—'}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply…" />
                <Button type="button" disabled={!reply || send.isPending} onClick={sendReply}>
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventsPage() {
  const { density } = useAdminCampus();
  const [view, setView] = useState<'month' | 'week' | 'list'>('list');
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const list = useEvents(page);
  const create = useCreateEvent();
  const addEvent = () =>
    create.mutate(
      { title, startsAt },
      {
        onSuccess: () => {
          toastSuccess('Event created');
          setTitle('');
          setStartsAt('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<SchoolEvent>[] = [
    { id: 'title', header: 'Event', cell: (r) => r.title },
    { id: 'starts', header: 'Starts', cell: (r) => r.startsAt },
    { id: 'ends', header: 'Ends', cell: (r) => r.endsAt ?? '—' },
    { id: 'location', header: 'Location', cell: (r) => r.location ?? '—' },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="School calendar"
        actions={
          <SegmentedControl
            aria-label="Calendar view"
            value={view}
            onValueChange={setView}
            options={[
              { value: 'month', label: 'Month' },
              { value: 'week', label: 'Week' },
              { value: 'list', label: 'List' },
            ]}
          />
        }
      />
      <PermissionGate permission="communication.event.create">
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-xs" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            type="datetime-local"
            className="max-w-xs"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <Button type="button" disabled={!title || !startsAt || create.isPending} onClick={addEvent}>
            Add
          </Button>
        </div>
      </PermissionGate>
      <QueryState isPending={list.isPending} error={list.error}>
        {view === 'list' ? (
          <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(list.data?.data ?? []).map((ev) => (
              <div key={ev.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="font-medium">{ev.title}</div>
                <div className="text-muted-foreground">{ev.startsAt}</div>
                {ev.location ? <div className="text-xs">{ev.location}</div> : null}
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

export function RemindersPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('email');
  const list = useReminders(page);
  const create = useCreateReminder();
  const toggle = useToggleReminder();
  const addReminder = () =>
    create.mutate(
      { name, channel },
      {
        onSuccess: () => {
          toastSuccess('Reminder created');
          setName('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<Reminder>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name },
    { id: 'channel', header: 'Channel', cell: (r) => r.channel ?? '—' },
    { id: 'schedule', header: 'Schedule', cell: (r) => r.schedule ?? '—' },
    {
      id: 'active',
      header: 'Active',
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            toggle.mutate(
              { id: r.id, isActive: !r.isActive },
              {
                onSuccess: () => toastSuccess('Updated'),
                onError: (e) => toastError('Failed', e.message),
              },
            )
          }
        >
          {r.isActive ? 'On' : 'Off'}
        </Button>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Reminders"
        actions={
          <PermissionGate permission="communication.reminder.create">
            <div className="flex gap-2">
              <Input className="max-w-xs" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              <select
                className="h-10 rounded-md border border-border bg-background px-2 text-sm"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push</option>
              </select>
              <Button type="button" disabled={!name || create.isPending} onClick={addReminder}>
                Add
              </Button>
            </div>
          </PermissionGate>
        }
      />
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}

export function NotificationTemplatesPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const list = useNotificationTemplates(page);
  const create = useCreateNotificationTemplate();
  const previewMutation = usePreviewNotificationTemplate();
  const addTemplate = () =>
    create.mutate(
      { name, channel, subject, body },
      {
        onSuccess: () => {
          toastSuccess('Template created');
          setName('');
          setSubject('');
          setBody('');
        },
        onError: (e) => toastError('Failed', e.message),
      },
    );
  const columns: DataTableColumn<NotificationTemplate>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (r) => (
        <button type="button" className="text-primary hover:underline" onClick={() => setSelectedId(r.id)}>
          {r.name}
        </button>
      ),
    },
    { id: 'channel', header: 'Channel', cell: (r) => r.channel },
    { id: 'active', header: 'Active', cell: (r) => (r.isActive ? 'Yes' : 'No') },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Notification templates" />
      <PermissionGate permission="notifications.template.create">
        <div className="grid max-w-xl gap-2 rounded-xl border border-border p-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <select
            className="h-10 rounded-md border border-border bg-background px-2 text-sm"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="push">Push</option>
          </select>
          <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea
            className="min-h-[80px] rounded-md border border-border bg-background p-2 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body"
          />
          <Button type="button" disabled={!name || create.isPending} onClick={addTemplate}>
            Create
          </Button>
        </div>
      </PermissionGate>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
      {selectedId != null ? (
        <div className="space-y-2 rounded-xl border border-border p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              previewMutation.mutate(
                { id: selectedId, data: { studentName: 'Sample' } },
                {
                  onSuccess: (data) => {
                    const rec = asRecord(data);
                    setPreview(str(rec?.body) || str(rec?.preview) || JSON.stringify(data, null, 2));
                  },
                  onError: (e) => toastError('Preview failed', e.message),
                },
              )
            }
          >
            Preview
          </Button>
          {preview ? <pre className="overflow-auto rounded-md bg-muted/40 p-3 text-xs">{preview}</pre> : null}
        </div>
      ) : null}
    </div>
  );
}

export function DeliveriesPage() {
  const { density } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const list = useDeliveries({ page, status });
  const retry = useRetryDelivery();
  const columns: DataTableColumn<Delivery>[] = [
    { id: 'recipient', header: 'Recipient', cell: (r) => r.recipient ?? '—' },
    { id: 'channel', header: 'Channel', cell: (r) => r.channel ?? '—' },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'when', header: 'When', cell: (r) => r.createdAt ?? '—' },
    {
      id: 'actions',
      header: '',
      cell: (r) =>
        r.status === 'failed' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              retry.mutate(r.id, {
                onSuccess: () => toastSuccess('Retry queued'),
                onError: (e) => toastError('Retry failed', e.message),
              })
            }
          >
            Retry
          </Button>
        ) : null,
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Delivery log"
        description="Ops monitoring for queues lives under /it — use this list for retries."
      />
      <FilterBar>
        <select
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="queued">Queued</option>
        </select>
      </FilterBar>
      <QueryState isPending={list.isPending} error={list.error}>
        <DataTable columns={columns} rows={list.data?.data ?? []} density={density} />
      </QueryState>
    </div>
  );
}
