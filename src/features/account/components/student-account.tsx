'use client';

import { useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera } from 'lucide-react';
import { formatAcademicPeriodLabel } from '@/components/shells/shell-nav';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { usePortalMe } from '@/features/portal/hooks/use-portal-me';
import { usePortalMePhoto } from '@/features/portal/hooks/use-portal-me-photo';
import { usePortalOverview } from '@/features/portal/hooks/use-portal-overview';
import { useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { useChangePassword } from '../hooks/use-change-password';
import { useRevokeSession } from '../hooks/use-revoke-session';
import { useSessions } from '../hooks/use-sessions';
import { changePasswordSchema, type ChangePasswordValues } from '../schemas';
import { NotificationPreferencesPanel } from './notification-preferences-panel';

const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

type AccountTab = 'profile' | 'security' | 'notifications' | 'sessions';

const TABS = [
  { value: 'profile' as const, label: 'Profile' },
  { value: 'security' as const, label: 'Security' },
  { value: 'notifications' as const, label: 'Notifications' },
  { value: 'sessions' as const, label: 'Sessions' },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border/70 py-3 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6',
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StudentAccount() {
  const { user } = useSession();
  const me = usePortalMe();
  const overview = usePortalOverview();
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const changePassword = useChangePassword();
  const photoMutation = usePortalMePhoto();
  const photoInputId = useId();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<AccountTab>('profile');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const sessionRows = asArray(sessions.data)
    .map((row) => asRecord(row))
    .filter((row): row is Record<string, unknown> => !!row);

  const profile = useMemo(() => {
    const meRoot = asRecord(me.data);
    const student = asRecord(meRoot?.student);
    const overviewRoot = asRecord(overview.data);
    const child = asRecord(overviewRoot?.child) ?? student;
    const enrolment = asRecord(overviewRoot?.enrolment);
    const period =
      asRecord(meRoot?.academicPeriod) ?? asRecord(overviewRoot?.academicPeriod);

    const first = str(child?.firstName);
    const middle = str(child?.middleName);
    const last = str(child?.lastName);
    const fullName =
      [first, middle, last].filter(Boolean).join(' ') ||
      str(user?.displayName) ||
      '—';

    const classLabel =
      str(child?.className) ||
      str(enrolment?.className) ||
      str(enrolment?.classLabel) ||
      str(asRecord(enrolment?.class)?.name) ||
      str(asRecord(child?.class)?.name);

    return {
      fullName,
      email: str(user?.email) || '—',
      studentNumber: str(child?.studentNumber) || '—',
      classLabel: classLabel || '—',
      academicPeriod: formatAcademicPeriodLabel({
        sessionName: str(period?.sessionName) || null,
        termName: str(period?.termName) || null,
      }) || '—',
      campusId: child?.campusId != null ? String(num(child.campusId)) : '—',
      photoUrl: str(student?.photoUrl) || str(child?.photoUrl) || null,
    };
  }, [me.data, overview.data, user?.displayName, user?.email]);

  const displayPhoto = photoPreview || profile.photoUrl;

  const initials = profile.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

  async function onPhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!PHOTO_ACCEPT.split(',').includes(file.type)) {
      toastError('Unsupported photo', 'Use a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toastError('Photo too large', 'Photo must be 5 MB or smaller.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    try {
      await photoMutation.mutateAsync(file);
      toastSuccess('Profile photo updated', 'Your new photo is now showing.');
    } catch (error) {
      toastError(
        'Could not update photo',
        (error instanceof Error && error.message) || 'Please try again.',
      );
    } finally {
      URL.revokeObjectURL(preview);
      setPhotoPreview(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Account & Settings"
        description="Security credentials, notification preferences, and read-only profile details."
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
        <Panel
          title="Student profile"
          description="Update your photo here. Name and class details are managed by the school office."
        >
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div className="relative">
              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed URL from file storage
                <img
                  src={displayPhoto}
                  alt=""
                  className="size-20 rounded-2xl object-cover ring-1 ring-border"
                />
              ) : (
                <span className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-semibold text-primary-foreground">
                  {initials}
                </span>
              )}
              <button
                type="button"
                aria-label="Change profile photo"
                disabled={photoMutation.isPending}
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Camera className="size-3.5" aria-hidden />
              </button>
              <input
                ref={photoInputRef}
                id={photoInputId}
                type="file"
                accept={PHOTO_ACCEPT}
                className="sr-only"
                onChange={(event) => void onPhotoSelected(event)}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <div>
                <p className="truncate font-heading text-xl font-semibold">{profile.fullName}</p>
                <p className="font-mono text-xs text-muted-foreground">{profile.studentNumber}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={photoMutation.isPending}
                onClick={() => photoInputRef.current?.click()}
              >
                {photoMutation.isPending ? 'Uploading…' : 'Change photo'}
              </Button>
              <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP · max 5 MB</p>
            </div>
          </div>

          <dl className="mt-2">
            <InfoRow label="Full name" value={profile.fullName} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Student ID" value={profile.studentNumber} />
            <InfoRow label="Class" value={profile.classLabel} />
            <InfoRow label="Academic period" value={profile.academicPeriod} />
            <InfoRow label="Campus ID" value={profile.campusId} />
          </dl>

          <p className="mt-4 text-sm text-muted-foreground">
            Name, class, and contact fields are read-only. Contact the school office for changes.
          </p>
        </Panel>
      ) : null}

      {tab === 'security' ? (
        <Panel title="Change password" description="Use a strong password you do not reuse elsewhere.">
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
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </Panel>
      ) : null}

      {tab === 'notifications' ? (
        <Panel
          title="Notifications"
          description="Choose which channels can reach you, and optional quiet hours for each."
        >
          <NotificationPreferencesPanel />
        </Panel>
      ) : null}

      {tab === 'sessions' ? (
        <Panel title="Active sessions" description="Devices signed in with your account.">
          {sessions.isPending ? (
            <p className="text-sm text-muted-foreground">Loading sessions…</p>
          ) : sessionRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other sessions listed.</p>
          ) : (
            <ul className="space-y-2">
              {sessionRows.map((row, index) => (
                <li
                  key={num(row.id, index)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {str(row.userAgent ?? row.device ?? 'Session')}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {str(row.lastSeenAt ?? row.createdAt).slice(0, 19)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revoke.isPending}
                    onClick={() =>
                      revoke.mutate(num(row.id), {
                        onSuccess: () =>
                          toastSuccess('Session revoked', 'That device has been signed out.'),
                        onError: (error) => toastError('Could not revoke session', error.message),
                      })
                    }
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
    </div>
  );
}
