'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useChangePassword,
  useNotificationPreferences,
  useRevokeSession,
  useSessions,
} from '../hooks/use-account';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/lib/auth/permissions';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function StudentAccount() {
  const { user } = useSession();
  const prefs = useNotificationPreferences();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const changePassword = useChangePassword();
  const [passwordOk, setPasswordOk] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const sessionRows = asArray(sessions.data)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => !!row);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">Your profile and security settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name: </span>
            {user?.displayName ?? '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            {user?.email ?? '—'}
          </p>
          <Alert className="mt-3">
            Ask the school office to change this. Students cannot edit personal details here.
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              setPasswordOk(false);
              await changePassword.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
              form.reset();
              setPasswordOk(true);
            })}
          >
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...form.register('currentPassword')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('newPassword')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-xs text-danger">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
            {changePassword.isError ? (
              <Alert variant="danger">Could not change password. Check your current password.</Alert>
            ) : null}
            {passwordOk ? <Alert variant="success">Password updated.</Alert> : null}
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {prefs.isPending
            ? 'Loading preferences…'
            : prefs.error
              ? 'Preferences are not available right now.'
              : 'Channel preferences are managed by your school. Contact the office to update them.'}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.isPending ? (
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          ) : sessionRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other sessions listed.</p>
          ) : (
            sessionRows.map((row, index) => (
              <div
                key={num(row.id, index)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{str(row.userAgent ?? row.device ?? 'Session')}</p>
                  <p className="text-xs text-muted-foreground">
                    {str(row.lastSeenAt ?? row.createdAt).slice(0, 19)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(num(row.id))}
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
