'use client';

import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useStaffMe } from '../hooks/use-staff-me';
import { formatDate, formatDateTime, fullName, statusLabel } from '../lib/format';
import {
  changePasswordSchema,
  NotificationPreferencesPanel,
  QueryState,
  useChangePassword,
  useRevokeSession,
  useSessions,
  type ChangePasswordValues,
} from '../lib/shared';
import { Panel } from './shared/panel';

type AccountTab = 'profile' | 'security' | 'notifications' | 'sessions';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'security', label: 'Security' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'sessions', label: 'Sessions' },
] as const;

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid gap-1 border-b border-border/70 py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function StaffAccount() {
  const [tab, setTab] = useState<AccountTab>('profile');
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
      {tab === 'profile' ? <ProfilePanel /> : null}
      {tab === 'security' ? <SecurityPanel /> : null}
      {tab === 'notifications' ? (
        <Panel
          title="Notifications"
          description="Choose which channels can reach you, and optional quiet hours for each."
        >
          <NotificationPreferencesPanel />
        </Panel>
      ) : null}
      {tab === 'sessions' ? <SessionsPanel /> : null}
    </div>
  );
}

function ProfilePanel() {
  const { user } = useSession();
  const me = useStaffMe();
  const data = me.data;
  const name = data ? fullName(data.firstName, data.lastName) : (user?.displayName ?? '');
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  return (
    <Panel
      title="Staff profile"
      description="Your details are managed by the school office. Contact them for changes."
    >
      <QueryState isPending={me.isPending} error={me.error} onRetry={() => void me.refetch()}>
        <div className="mb-4 flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-semibold text-primary-foreground">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-xl font-semibold">{name || '—'}</p>
            <p className="font-mono text-xs text-muted-foreground">{data?.staffNumber}</p>
          </div>
        </div>
        <dl>
          <InfoRow label="Job title" value={data ? statusLabel(data.jobTitle) : undefined} />
          <InfoRow label="Email" value={data?.email ?? user?.email} />
          <InfoRow label="Phone" value={data?.phone} />
          <InfoRow label="Status" value={data ? statusLabel(data.status) : undefined} />
          <InfoRow label="Hire date" value={data ? formatDate(data.hireDate) : undefined} />
        </dl>
      </QueryState>
    </Panel>
  );
}

function SecurityPanel() {
  const ids = { current: useId(), next: useId(), confirm: useId() };
  const changePassword = useChangePassword();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { errors } = form.formState;

  return (
    <Panel title="Change password" description="Use a strong password you don’t reuse elsewhere.">
      <form
        className="max-w-md space-y-3"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await changePassword.mutateAsync({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            });
            form.reset();
            toastSuccess('Password updated', 'Use your new password next time you sign in.');
          } catch (error) {
            toastError(
              'Could not change password',
              (error instanceof Error && error.message) ||
                'Check your current password and try again.',
            );
          }
        })}
      >
        <div className="space-y-1.5">
          <Label htmlFor={ids.current}>Current password</Label>
          <Input
            id={ids.current}
            type="password"
            autoComplete="current-password"
            {...form.register('currentPassword')}
          />
          {errors.currentPassword ? (
            <p className="text-xs text-danger">{errors.currentPassword.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.next}>New password</Label>
          <Input
            id={ids.next}
            type="password"
            autoComplete="new-password"
            {...form.register('newPassword')}
          />
          {errors.newPassword ? (
            <p className="text-xs text-danger">{errors.newPassword.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={ids.confirm}>Confirm password</Label>
          <Input
            id={ids.confirm}
            type="password"
            autoComplete="new-password"
            {...form.register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </Panel>
  );
}

type SessionRow = { id: number; label: string; seen: string };

function toSessionRows(value: unknown): SessionRow[] {
  if (!Array.isArray(value)) return [];
  const rows: SessionRow[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'number') continue;
    const label = [record.userAgent, record.device].find((v) => typeof v === 'string' && v) as
      | string
      | undefined;
    const seen = [record.lastSeenAt, record.createdAt].find((v) => typeof v === 'string' && v) as
      | string
      | undefined;
    rows.push({ id: record.id, label: label ?? 'Signed-in device', seen: formatDateTime(seen) });
  }
  return rows;
}

function SessionsPanel() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const rows = useMemo(() => toSessionRows(sessions.data), [sessions.data]);

  return (
    <Panel title="Active sessions" description="Devices signed in with your account.">
      <QueryState
        isPending={sessions.isPending}
        error={sessions.error}
        onRetry={() => void sessions.refetch()}
        isEmpty={rows.length === 0}
        empty={<p className="text-sm text-muted-foreground">No other sessions listed.</p>}
      >
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{row.label}</p>
                {row.seen ? <p className="text-xs text-muted-foreground">{row.seen}</p> : null}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={revoke.isPending}
                onClick={() =>
                  revoke.mutate(row.id, {
                    onSuccess: () => toastSuccess('Session revoked', 'That device has been signed out.'),
                    onError: (error) => toastError('Could not revoke session', error.message),
                  })
                }
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </QueryState>
    </Panel>
  );
}
