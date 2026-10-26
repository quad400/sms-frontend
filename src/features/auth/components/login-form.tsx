'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError } from '@/lib/api/errors';
import { resolvePostLoginPath } from '@/lib/auth/portal';
import type { SessionUser } from '@/lib/auth/types';
import { motion } from '@/lib/motion/classes';
import { toastError } from '@/lib/toast';
import { useLogin } from '../hooks/use-login';
import { useVerify2fa } from '../hooks/use-verify-2fa';
import {
  loginSchema,
  twoFactorSchema,
  type LoginValues,
  type TwoFactorValues,
} from '../schemas';

type ChallengeState = { challengeToken: string };

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiClientError)) {
    return 'Unable to sign in. Please try again.';
  }
  const { code, message } = error.mapped;
  if (code === 'ACCOUNT_LOCKED' || code === 'USER_NOT_ACTIVE') {
    return 'This account is locked. Contact the school.';
  }
  if (code === 'THROTTLED') {
    return message || 'Too many attempts. Please wait and try again.';
  }
  return 'Invalid email/phone or password.';
}

export function LoginForm({ schoolName }: { schoolName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const loginMutation = useLogin();
  const verifyMutation = useVerify2fa();
  const pending = loginMutation.isPending || verifyMutation.isPending;

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const twoFactorForm = useForm<TwoFactorValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (challenge) {
      twoFactorForm.setFocus('code');
    }
  }, [challenge, twoFactorForm]);

  async function completeLogin(user: SessionUser) {
    const path = resolvePostLoginPath(user, next);
    router.replace(path);
    router.refresh();
  }

  async function onLogin(values: LoginValues) {
    try {
      const result = await loginMutation.mutateAsync(values);
      if (result.kind === 'challenge') {
        setChallenge({ challengeToken: result.challengeToken });
        return;
      }
      await completeLogin(result.user);
    } catch (error) {
      toastError('Could not sign in', loginErrorMessage(error));
    }
  }

  async function onVerify(values: TwoFactorValues) {
    if (!challenge) {
      return;
    }
    try {
      const result = await verifyMutation.mutateAsync({
        code: values.code,
        challengeToken: challenge.challengeToken,
      });
      await completeLogin(result.user);
    } catch (error) {
      if (error instanceof ApiClientError) {
        toastError('Verification failed', error.mapped.message || 'Invalid authentication code.');
      } else {
        toastError('Verification failed', 'Unable to verify the code. Please try again.');
      }
    }
  }

  return (
    <Card className={`w-full max-w-md ${motion.pageEnter}`}>
      <CardHeader>
        <CardTitle>{schoolName}</CardTitle>
        <CardDescription>
          {challenge ? 'Enter the code from your authenticator app.' : 'Sign in to continue.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!challenge ? (
          <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or phone</Label>
              <Input
                id="identifier"
                autoComplete="username"
                {...loginForm.register('identifier')}
              />
              {loginForm.formState.errors.identifier ? (
                <p className="text-xs text-danger">{loginForm.formState.errors.identifier.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-brand hover:underline">
                  Forgot password
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password ? (
                <p className="text-xs text-danger">{loginForm.formState.errors.password.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        ) : (
          <form
            className={`space-y-4 ${motion.stepSwap}`}
            onSubmit={twoFactorForm.handleSubmit(onVerify)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="code">Authentication code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                {...twoFactorForm.register('code')}
              />
              {twoFactorForm.formState.errors.code ? (
                <p className="text-xs text-danger">{twoFactorForm.formState.errors.code.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify and continue
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setChallenge(null);
                twoFactorForm.reset();
              }}
            >
              Back to password
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
