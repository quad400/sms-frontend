'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  Banknote,
  Bell,
  Check,
  GraduationCap,
  Home,
  KeyRound,
  MessagesSquare,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { usePatchPortalContact } from '../hooks/use-portal-feed';
import {
  changePasswordSchema,
  NotificationPreferencesPanel,
  useChangePassword,
  type ChangePasswordValues,
} from '../lib/shared';

const WELCOME_DONE_KEY = 'sms.parent.welcome.done';

type Step = 'password' | 'phone' | 'notifications' | 'install';

const STEPS: { id: Step; label: string }[] = [
  { id: 'password', label: 'Secure' },
  { id: 'phone', label: 'Contact' },
  { id: 'notifications', label: 'Alerts' },
  { id: 'install', label: 'Pin' },
];

const phoneSchema = z.object({
  phone: z.string().min(7, 'Enter a valid phone number'),
});

export function isParentWelcomeDone(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

export function ParentWelcome() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const patchContact = usePatchPortalContact();
  const [step, setStep] = useState<Step>('password');
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function finish() {
    try {
      window.localStorage.setItem(WELCOME_DONE_KEY, '1');
    } catch {
      // ignore
    }
    router.replace('/parent');
    router.refresh();
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 h-56 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--academic)_22%,transparent),transparent_70%)]"
      />
      <div className="relative space-y-8">
        <header className="space-y-4 text-center sm:text-left">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-academic">
            Parent portal
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            A few quick steps so you can follow attendance, results and fees for your children.
          </p>
          <ol className="flex items-center justify-center gap-2 sm:justify-start" aria-label="Setup progress">
            {STEPS.map((item, index) => {
              const done = index < stepIndex;
              const current = index === stepIndex;
              return (
                <li key={item.id} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                      done && 'bg-academic text-white',
                      current && 'bg-foreground text-background',
                      !done && !current && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
                  </span>
                  <span className="hidden text-xs font-medium sm:inline">{item.label}</span>
                </li>
              );
            })}
          </ol>
        </header>

        {step === 'password' ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <KeyRound className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading font-semibold">Set a new password</h2>
                <p className="text-sm text-muted-foreground">Replace the temporary password from the school.</p>
              </div>
            </div>
            <form
              className="space-y-3"
              onSubmit={passwordForm.handleSubmit(async (values) => {
                try {
                  await changePassword.mutateAsync({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                  });
                  toastSuccess('Password updated');
                  setStep('phone');
                } catch (error) {
                  toastError(
                    'Could not change password',
                    error instanceof Error ? error.message : 'Try again.',
                  );
                }
              })}
            >
              <div className="space-y-1.5">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" autoComplete="current-password" {...passwordForm.register('currentPassword')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="next">New password</Label>
                <Input id="next" type="password" autoComplete="new-password" {...passwordForm.register('newPassword')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" autoComplete="new-password" {...passwordForm.register('confirmPassword')} />
              </div>
              <Button type="submit" className="w-full" disabled={changePassword.isPending}>
                Continue <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>
          </section>
        ) : null}

        {step === 'phone' ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="font-heading font-semibold">Confirm your phone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Used for SMS alerts about absences and fees.
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={phoneForm.handleSubmit(async (values) => {
                try {
                  await patchContact.mutateAsync({ phone: values.phone });
                  toastSuccess('Phone saved');
                  setStep('notifications');
                } catch (error) {
                  toastError(
                    'Could not save phone',
                    error instanceof Error ? error.message : 'Try again.',
                  );
                }
              })}
            >
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" autoComplete="tel" {...phoneForm.register('phone')} />
              </div>
              <Button type="submit" className="w-full" disabled={patchContact.isPending}>
                Continue <ArrowRight className="size-4" aria-hidden />
              </Button>
            </form>
          </section>
        ) : null}

        {step === 'notifications' ? (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Bell className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading font-semibold">Notification channels</h2>
                <p className="text-sm text-muted-foreground">Pick how the school can reach you.</p>
              </div>
            </div>
            <NotificationPreferencesPanel />
            <Button type="button" className="mt-4 w-full" onClick={() => setStep('install')}>
              Continue <ArrowRight className="size-4" aria-hidden />
            </Button>
          </section>
        ) : null}

        {step === 'install' ? (
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Smartphone className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-heading font-semibold">Add to Home Screen</h2>
                <p className="text-sm text-muted-foreground">
                  On your phone browser, open the share menu and choose “Add to Home Screen”.
                </p>
              </div>
            </div>
            <ul className="grid gap-2 text-sm">
              {[
                { icon: Home, label: 'Home — today and fees alerts' },
                { icon: GraduationCap, label: 'Results — term scores' },
                { icon: Banknote, label: 'Fees — pay invoices' },
                { icon: MessagesSquare, label: 'Messages — teachers' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                  <item.icon className="size-4 text-muted-foreground" aria-hidden />
                  {item.label}
                </li>
              ))}
            </ul>
            <Button type="button" className="w-full" onClick={finish}>
              Go to home
            </Button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
