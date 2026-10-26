'use client';

import { useId, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { useActiveChild } from '../hooks/use-active-child';
import { usePatchPortalContact, usePortalMe } from '../hooks/use-portal-feed';
import { childName } from '../lib/format';
import {
  changePasswordSchema,
  NotificationPreferencesPanel,
  QueryState,
  useChangePassword,
  useRevokeSession,
  useSessions,
  type ChangePasswordValues,
} from '../lib/shared';

type Tab = 'profile' | 'children' | 'notifications' | 'security' | 'privacy';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'children', label: 'Children' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security' },
  { value: 'privacy', label: 'Privacy' },
] as const;

const contactSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ParentAccount() {
  const [tab, setTab] = useState<Tab>('profile');
  return (
    <div className="space-y-5">
      <PageHeader
        title="Account"
        description="Your contact details, children, security and privacy."
        actions={
          <SegmentedControl
            aria-label="Account sections"
            value={tab}
            onValueChange={setTab}
            options={[...TABS]}
            className="w-full max-w-full overflow-x-auto sm:w-fit"
          />
        }
      />
      {tab === 'profile' ? <ProfileTab /> : null}
      {tab === 'children' ? <ChildrenTab /> : null}
      {tab === 'notifications' ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
          <h2 className="font-heading text-base font-semibold">Notifications</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose which channels can reach you.
          </p>
          <NotificationPreferencesPanel />
        </section>
      ) : null}
      {tab === 'security' ? <SecurityTab /> : null}
      {tab === 'privacy' ? <PrivacyTab /> : null}
    </div>
  );
}

function ProfileTab() {
  const me = usePortalMe();
  const patch = usePatchPortalContact();
  const { user } = useSession();
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    values: {
      phone: me.data?.phone ?? '',
      email: me.data?.email ?? user?.email ?? '',
      address: me.data?.address ?? '',
    },
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
      <h2 className="font-heading text-base font-semibold">Profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Update the phone and email the school uses to reach you.
      </p>
      <QueryState isPending={me.isPending} error={me.error} onRetry={() => void me.refetch()}>
        <form
          className="max-w-md space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await patch.mutateAsync({
                phone: values.phone,
                email: values.email || null,
                address: values.address || null,
              });
              toastSuccess('Contact updated', 'Your details were saved.');
            } catch (error) {
              toastError(
                'Could not save',
                error instanceof Error ? error.message : 'Please try again.',
              );
            }
          })}
        >
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register('phone')} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-danger">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register('address')} />
          </div>
          <Button type="submit" disabled={patch.isPending}>
            {patch.isPending ? 'Saving…' : 'Save contact'}
          </Button>
        </form>
      </QueryState>
    </section>
  );
}

function ChildrenTab() {
  const { children, isPending, error, refetch } = useActiveChild();
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
      <h2 className="font-heading text-base font-semibold">Children</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Linked students on your account. Relationships are managed by the school.
      </p>
      <QueryState isPending={isPending} error={error} onRetry={refetch}>
        <ul className="grid gap-2">
          {children.map((child) => (
            <li
              key={child.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{childName(child)}</p>
                <p className="text-xs text-muted-foreground">
                  {child.relationship
                    ? child.relationship
                    : child.className ?? (child.classId ? `Class ${child.classId}` : 'Linked child')}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{child.studentNumber}</span>
            </li>
          ))}
        </ul>
      </QueryState>
    </section>
  );
}

function SecurityTab() {
  const ids = { current: useId(), next: useId(), confirm: useId() };
  const changePassword = useChangePassword();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const sessionRows = useMemo(() => {
    const value = sessions.data;
    const list = Array.isArray(value)
      ? value
      : Array.isArray((value as { sessions?: unknown } | undefined)?.sessions)
        ? ((value as { sessions: unknown[] }).sessions)
        : [];
    return list.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const record = item as Record<string, unknown>;
      if (typeof record.id !== 'number') return [];
      const label = [record.userAgent, record.device].find((v) => typeof v === 'string' && v) as
        | string
        | undefined;
      return [{ id: record.id, label: label ?? 'Signed-in device' }];
    });
  }, [sessions.data]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 className="font-heading text-base font-semibold">Change password</h2>
        <form
          className="mt-4 max-w-md space-y-3"
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
                error instanceof Error ? error.message : 'Check your current password.',
              );
            }
          })}
        >
          <div className="space-y-1.5">
            <Label htmlFor={ids.current}>Current password</Label>
            <Input id={ids.current} type="password" autoComplete="current-password" {...form.register('currentPassword')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={ids.next}>New password</Label>
            <Input id={ids.next} type="password" autoComplete="new-password" {...form.register('newPassword')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={ids.confirm}>Confirm password</Label>
            <Input id={ids.confirm} type="password" autoComplete="new-password" {...form.register('confirmPassword')} />
          </div>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 className="font-heading text-base font-semibold">Sessions</h2>
        <p className="mb-3 text-sm text-muted-foreground">Devices signed in to your account.</p>
        <QueryState isPending={sessions.isPending} error={sessions.error}>
          <ul className="grid gap-2">
            {sessionRows.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">{session.label}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revoke.isPending}
                  onClick={() =>
                    revoke.mutate(session.id, {
                      onError: (error) => toastError('Could not revoke', error.message),
                      onSuccess: () => toastSuccess('Session revoked'),
                    })
                  }
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        </QueryState>
      </section>
    </div>
  );
}

function PrivacyTab() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
      <h2 className="font-heading text-base font-semibold">Privacy</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Consents for each child are managed by the school. To request a data correction, message the
        school office from Messages.
      </p>
      <Link href="/parent/messages" className="mt-4 inline-flex text-sm font-medium text-brand underline-offset-4 hover:underline">
        Open messages
      </Link>
    </section>
  );
}
