'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { asArray, asRecord, str } from '@/lib/utils/record';
import { useNotificationPreferences } from '../hooks/use-notification-preferences';
import { useUpdateNotificationPreferences } from '../hooks/use-update-notification-preferences';
import type { NotificationPreferenceItem } from '../types';

const CHANNEL_META: Record<
  NotificationPreferenceItem['channel'],
  { label: string; hint: string }
> = {
  email: { label: 'Email', hint: 'Messages to your school email address' },
  sms: { label: 'SMS', hint: 'Text messages to your registered phone' },
  whatsapp: { label: 'WhatsApp', hint: 'Alerts via WhatsApp when available' },
  push: { label: 'Push', hint: 'Browser or device push notifications' },
  'in-app': { label: 'In-app', hint: 'Bell inbox inside the portal' },
};

function normalizePrefs(data: unknown): NotificationPreferenceItem[] {
  return asArray(data)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => !!row)
    .map((row) => {
      const channel = str(row.channel) as NotificationPreferenceItem['channel'];
      return {
        channel,
        isEnabled: row.isEnabled !== false,
        quietHoursStart: str(row.quietHoursStart) || null,
        quietHoursEnd: str(row.quietHoursEnd) || null,
      };
    })
    .filter((row) => row.channel in CHANNEL_META);
}

function samePrefs(a: NotificationPreferenceItem[], b: NotificationPreferenceItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      !!other &&
      item.channel === other.channel &&
      item.isEnabled === other.isEnabled &&
      (item.quietHoursStart || null) === (other.quietHoursStart || null) &&
      (item.quietHoursEnd || null) === (other.quietHoursEnd || null)
    );
  });
}

export function NotificationPreferencesPanel() {
  const prefs = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const remote = useMemo(() => normalizePrefs(prefs.data), [prefs.data]);
  const [draft, setDraft] = useState<NotificationPreferenceItem[]>([]);

  useEffect(() => {
    if (remote.length > 0) setDraft(remote);
  }, [remote]);

  const loadError = prefs.error ? prefs.error.message || 'Preferences are not available right now.' : null;
  useEffect(() => {
    if (loadError) toastError('Could not load preferences', loadError);
  }, [loadError]);

  const dirty = draft.length > 0 && !samePrefs(draft, remote);
  const quietInvalid = draft.some((item) => {
    const start = item.quietHoursStart?.trim() || '';
    const end = item.quietHoursEnd?.trim() || '';
    if (!start && !end) return false;
    if (!start || !end) return true;
    return !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end);
  });

  function patchChannel(
    channel: NotificationPreferenceItem['channel'],
    patch: Partial<NotificationPreferenceItem>,
  ) {
    setDraft((current) =>
      current.map((item) => (item.channel === channel ? { ...item, ...patch } : item)),
    );
  }

  async function onSave() {
    if (!dirty || quietInvalid || update.isPending) return;
    const payload = draft.map((item) => ({
      channel: item.channel,
      isEnabled: item.isEnabled,
      quietHoursStart: item.quietHoursStart?.trim() || null,
      quietHoursEnd: item.quietHoursEnd?.trim() || null,
    }));
    try {
      await update.mutateAsync(payload);
      toastSuccess('Preferences saved', 'Your notification preferences have been updated.');
    } catch (error) {
      toastError(
        'Could not save preferences',
        (error instanceof Error && error.message) || 'Please try again.',
      );
    }
  }

  if (prefs.isPending) {
    return <p className="text-sm text-muted-foreground">Loading preferences…</p>;
  }

  if (prefs.error) {
    return <p className="text-sm text-muted-foreground">{loadError}</p>;
  }

  if (draft.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No notification channels are configured for your school yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {draft.map((item) => {
          const meta = CHANNEL_META[item.channel];
          return (
            <li key={item.channel} className="bg-card px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{meta.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.hint}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.isEnabled}
                  aria-label={`${meta.label} notifications`}
                  disabled={update.isPending}
                  onClick={() => patchChannel(item.channel, { isEnabled: !item.isEnabled })}
                  className={cn(
                    'inline-flex h-8 w-14 shrink-0 items-center rounded-full px-1 transition-colors',
                    item.isEnabled ? 'bg-academic' : 'bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-transform',
                      item.isEnabled ? 'translate-x-6' : 'translate-x-0',
                    )}
                  >
                    {item.isEnabled ? (
                      <Bell className="size-3 text-academic" aria-hidden />
                    ) : (
                      <BellOff className="size-3 text-muted-foreground" aria-hidden />
                    )}
                  </span>
                </button>
              </div>

              {item.isEnabled ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`quiet-start-${item.channel}`}>Quiet hours start</Label>
                    <Input
                      id={`quiet-start-${item.channel}`}
                      type="time"
                      value={item.quietHoursStart ?? ''}
                      disabled={update.isPending}
                      onChange={(event) =>
                        patchChannel(item.channel, {
                          quietHoursStart: event.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`quiet-end-${item.channel}`}>Quiet hours end</Label>
                    <Input
                      id={`quiet-end-${item.channel}`}
                      type="time"
                      value={item.quietHoursEnd ?? ''}
                      disabled={update.isPending}
                      onChange={(event) =>
                        patchChannel(item.channel, {
                          quietHoursEnd: event.target.value || null,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Optional. Leave blank to allow alerts at any time.
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {quietInvalid ? (
        <p className="text-xs text-danger">Set both quiet-hour times, or clear both.</p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!dirty || quietInvalid || update.isPending}
          onClick={() => void onSave()}
        >
          {update.isPending ? 'Saving…' : 'Save preferences'}
        </Button>
      </div>
    </div>
  );
}
