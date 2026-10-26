'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Home,
  KeyRound,
  MoreHorizontal,
  Smartphone,
} from 'lucide-react';
import { useChangePassword } from '../hooks/use-change-password';
import { changePasswordSchema, type ChangePasswordValues } from '../schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';

const WELCOME_DONE_KEY = 'sms.student.welcome.done';

type Step = 'password' | 'tour' | 'install';

const STEPS: { id: Step; label: string }[] = [
  { id: 'password', label: 'Secure' },
  { id: 'tour', label: 'Explore' },
  { id: 'install', label: 'Pin' },
];

const TOUR_ITEMS = [
  {
    icon: Home,
    title: 'Home',
    body: 'Today’s schedule, live classes, and what needs attention.',
  },
  {
    icon: CalendarDays,
    title: 'Timetable',
    body: 'Your periods, rooms, and teachers for the week.',
  },
  {
    icon: BookOpen,
    title: 'Results',
    body: 'Scores and grades as they are published each term.',
  },
  {
    icon: MoreHorizontal,
    title: 'More',
    body: 'Attendance, fees, library, medical, and account.',
  },
] as const;

export function StudentWelcome() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const [step, setStep] = useState<Step>('password');
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function finish() {
    try {
      window.localStorage.setItem(WELCOME_DONE_KEY, '1');
    } catch {
      // ignore storage failures
    }
    router.replace('/student');
    router.refresh();
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 h-56 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--academic)_22%,transparent),transparent_70%)]"
      />

      <div className="relative space-y-8 motion-page-enter">
        <header className="space-y-4 text-center sm:text-left">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-academic">
            Student portal
          </p>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-[2.125rem]">
              Welcome aboard
            </h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground sm:mx-0">
              Three quick steps to lock down your account and find your way around.
            </p>
          </div>

          <ol className="flex items-center justify-center gap-2 sm:justify-start" aria-label="Setup progress">
            {STEPS.map((item, index) => {
              const done = index < stepIndex;
              const current = index === stepIndex;
              return (
                <li key={item.id} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'hidden h-px w-6 sm:block',
                        done || current ? 'bg-academic/40' : 'bg-border',
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors',
                      done && 'bg-academic text-academic-foreground',
                      current && 'bg-academic/15 text-academic ring-1 ring-academic/30',
                      !done && !current && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3" aria-hidden /> : null}
                    <span className="tabular-nums">{index + 1}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </header>

        <div key={step} className="motion-step-swap">
          {step === 'password' ? (
            <section
              aria-labelledby="welcome-password-title"
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start gap-3 border-b border-border bg-muted/40 px-5 py-4 sm:px-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-academic/12 text-academic">
                  <KeyRound className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 id="welcome-password-title" className="font-heading text-lg font-semibold">
                    Secure your account
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Replace the temporary password before you continue.
                  </p>
                </div>
              </div>

              <form
                className="space-y-4 p-5 sm:p-6"
                onSubmit={form.handleSubmit(async (values) => {
                  try {
                    await changePassword.mutateAsync({
                      currentPassword: values.currentPassword,
                      newPassword: values.newPassword,
                    });
                    toastSuccess('Password updated', 'Your account is now secured.');
                    setStep('tour');
                  } catch (error) {
                    toastError(
                      'Could not update password',
                      (error instanceof Error && error.message) ||
                        'Check your current password and try again.',
                    );
                  }
                })}
              >
                <Field
                  id="welcome-current"
                  label="Current password"
                  error={form.formState.errors.currentPassword?.message}
                >
                  <Input
                    id="welcome-current"
                    type="password"
                    autoComplete="current-password"
                    {...form.register('currentPassword')}
                  />
                </Field>
                <Field
                  id="welcome-new"
                  label="New password"
                  hint="At least 8 characters"
                  error={form.formState.errors.newPassword?.message}
                >
                  <Input
                    id="welcome-new"
                    type="password"
                    autoComplete="new-password"
                    {...form.register('newPassword')}
                  />
                </Field>
                <Field
                  id="welcome-confirm"
                  label="Confirm new password"
                  error={form.formState.errors.confirmPassword?.message}
                >
                  <Input
                    id="welcome-confirm"
                    type="password"
                    autoComplete="new-password"
                    {...form.register('confirmPassword')}
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="w-full bg-academic text-academic-foreground hover:bg-academic/90"
                >
                  {changePassword.isPending ? 'Saving…' : 'Save and continue'}
                  <ArrowRight aria-hidden />
                </Button>
              </form>
            </section>
          ) : null}

          {step === 'tour' ? (
            <section
              aria-labelledby="welcome-tour-title"
              className="space-y-5 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6"
            >
              <div className="space-y-1">
                <h2 id="welcome-tour-title" className="font-heading text-lg font-semibold">
                  Find your way around
                </h2>
                <p className="text-sm text-muted-foreground">
                  On phones, the bottom tabs are your main shortcuts. On larger screens, use the side panel.
                </p>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2">
                {TOUR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.title}
                      className="rounded-xl border border-border bg-muted/40 p-4 transition-colors hover:bg-muted/70"
                    >
                      <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-academic/12 text-academic">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <p className="font-heading text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                    </li>
                  );
                })}
              </ul>

              <Button
                type="button"
                className="w-full bg-academic text-academic-foreground hover:bg-academic/90"
                onClick={() => setStep('install')}
              >
                Next
                <ArrowRight aria-hidden />
              </Button>
            </section>
          ) : null}

          {step === 'install' ? (
            <section
              aria-labelledby="welcome-install-title"
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary)_72%,var(--academic))] px-5 py-8 text-primary-foreground sm:px-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-academic/30 blur-2xl"
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
                    <Smartphone className="size-6" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h2 id="welcome-install-title" className="font-heading text-xl font-semibold">
                      Keep it one tap away
                    </h2>
                    <p className="text-sm text-primary-foreground/80">
                      Add the portal to your home screen for faster access without hunting through bookmarks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-academic/12 font-mono text-[11px] font-semibold text-academic">
                      1
                    </span>
                    <span>
                      Open your phone browser’s <strong className="text-foreground">Share</strong> or{' '}
                      <strong className="text-foreground">Menu</strong> button.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-academic/12 font-mono text-[11px] font-semibold text-academic">
                      2
                    </span>
                    <span>
                      Choose <strong className="text-foreground">Add to Home Screen</strong>.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-academic/12 font-mono text-[11px] font-semibold text-academic">
                      3
                    </span>
                    <span>Confirm — then launch the portal like an app.</span>
                  </li>
                </ol>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    className="flex-1 bg-academic text-academic-foreground hover:bg-academic/90"
                    onClick={finish}
                  >
                    Go to Home
                    <ArrowRight aria-hidden />
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={finish}>
                    Skip for now
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function isStudentWelcomeDone(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(WELCOME_DONE_KEY) === '1';
  } catch {
    return true;
  }
}
