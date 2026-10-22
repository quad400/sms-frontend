'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '../hooks/use-account';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const WELCOME_DONE_KEY = 'sms.student.welcome.done';

export function StudentWelcome() {
  const router = useRouter();
  const changePassword = useChangePassword();
  const [step, setStep] = useState<'password' | 'tour' | 'install'>('password');
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

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
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-sm text-muted-foreground">A quick setup before you start.</p>
      </div>

      {step === 'password' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Change your password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(async (values) => {
                await changePassword.mutateAsync({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                setStep('tour');
              })}
            >
              <div className="space-y-1.5">
                <Label htmlFor="welcome-current">Current password</Label>
                <Input id="welcome-current" type="password" {...form.register('currentPassword')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="welcome-new">New password</Label>
                <Input id="welcome-new" type="password" {...form.register('newPassword')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="welcome-confirm">Confirm password</Label>
                <Input id="welcome-confirm" type="password" {...form.register('confirmPassword')} />
              </div>
              {changePassword.isError ? (
                <Alert variant="danger">Could not update password. Try again.</Alert>
              ) : null}
              <Button type="submit" disabled={changePassword.isPending} className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 'tour' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Find your way around</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use the bottom tabs on your phone:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-foreground">Home</strong> — today at a glance
              </li>
              <li>
                <strong className="text-foreground">Timetable</strong> — your periods
              </li>
              <li>
                <strong className="text-foreground">Results</strong> — scores and grades
              </li>
              <li>
                <strong className="text-foreground">More</strong> — attendance, fees, account
              </li>
            </ul>
            <Button type="button" className="w-full" onClick={() => setStep('install')}>
              Next
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 'install' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Add to home screen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              On your phone browser, open the share or menu button and choose{' '}
              <strong className="text-foreground">Add to Home Screen</strong> for quicker access.
            </p>
            <Button type="button" className="w-full" onClick={finish}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
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
