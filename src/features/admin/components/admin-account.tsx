'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  changePasswordSchema,
  NotificationPreferencesPanel,
  QueryState,
  useChangePassword,
  useRevokeSession,
  useSessions,
  type ChangePasswordValues,
} from '../lib/shared';

type AccountTab = 'profile' | 'security' | 'notifications' | 'sessions';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'sessions', label: 'Sessions' },
] as const;

export function AdminAccount() {
  const [tab, setTab] = useState<AccountTab>('profile');
  const { user } = useSession();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Account & Settings"
        description="Your profile, password, notification preferences and signed-in devices."
        actions={
          <SegmentedControl
            aria-label="Account sections"
            value={tab}
            onValueChange={setTab}
            options={TABS}
            className="w-full sm:w-fit"
          />
        }
      />
      {tab === 'profile' ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-heading text-lg font-semibold">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user?.displayName ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium">{user?.userType ?? '—'}</dd>
            </div>
          </dl>
        </section>
      ) : null}
      {tab === 'security' ? <SecurityPanel /> : null}
      {tab === 'notifications' ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <NotificationPreferencesPanel />
        </section>
      ) : null}
      {tab === 'sessions' ? <SessionsPanel /> : null}
    </div>
  );
}

function SecurityPanel() {
  const id = useId();
  const change = useChangePassword();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold">Change password</h2>
      <form
        className="grid max-w-md gap-3"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await change.mutateAsync({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            });
            toastSuccess('Password updated');
            form.reset();
          } catch (e) {
            toastError('Could not update password', e instanceof Error ? e.message : undefined);
          }
        })}
      >
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-current`}>Current password</Label>
          <Input id={`${id}-current`} type="password" autoComplete="current-password" {...form.register('currentPassword')} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-new`}>New password</Label>
          <Input id={`${id}-new`} type="password" autoComplete="new-password" {...form.register('newPassword')} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-confirm`}>Confirm</Label>
          <Input id={`${id}-confirm`} type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
        </div>
        <Button type="submit" disabled={change.isPending}>
          {change.isPending ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </section>
  );
}

function SessionsPanel() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const rows = toSessionRows(sessions.data);

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 font-heading text-lg font-semibold">Signed-in devices</h2>
      <QueryState isPending={sessions.isPending} error={sessions.error} onRetry={() => void sessions.refetch()}>
        <ul className="space-y-2">
          {rows.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.seen}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={revoke.isPending}
                onClick={async () => {
                  try {
                    await revoke.mutateAsync(s.id);
                    toastSuccess('Session revoked');
                  } catch (e) {
                    toastError('Could not revoke', e instanceof Error ? e.message : undefined);
                  }
                }}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </QueryState>
    </section>
  );
}

function toSessionRows(value: unknown): Array<{ id: number; label: string; seen: string }> {
  if (!Array.isArray(value)) return [];
  const rows: Array<{ id: number; label: string; seen: string }> = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'number') continue;
    const label =
      ([record.userAgent, record.device].find((v) => typeof v === 'string' && v) as string | undefined) ||
      'Session';
    const seen =
      ([record.lastSeenAt, record.createdAt].find((v) => typeof v === 'string' && v) as string | undefined) ||
      '';
    rows.push({ id: record.id, label, seen });
  }
  return rows;
}
