'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  loginSchema,
  twoFactorSchema,
  type LoginValues,
  type TwoFactorValues,
} from '../schemas/auth-schemas';
import { isApiErrorBody } from '@/lib/api/errors';
import { resolvePostLoginPath } from '@/lib/auth/portal';
import type { SessionUser } from '@/lib/auth/types';
import { motion } from '@/lib/motion/classes';

type ChallengeState = { challengeToken: string };

export function LoginForm({ schoolName }: { schoolName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [showPassword, setShowPassword] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
    setFormError(null);
    setPending(true);
    try {
      const response = await fetch('/api/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        if (isApiErrorBody(payload)) {
          if (payload.code === 'ACCOUNT_LOCKED' || payload.code === 'USER_NOT_ACTIVE') {
            setFormError('This account is locked. Contact the school.');
          } else if (payload.code === 'THROTTLED' || response.status === 429) {
            setFormError(payload.message || 'Too many attempts. Please wait and try again.');
          } else {
            setFormError('Invalid email/phone or password.');
          }
        } else {
          setFormError('Unable to sign in. Please try again.');
        }
        return;
      }

      if (
        payload &&
        typeof payload === 'object' &&
        'challenge' in payload &&
        payload.challenge &&
        typeof payload.challenge === 'object' &&
        'challengeToken' in payload.challenge
      ) {
        setChallenge({
          challengeToken: String((payload.challenge as { challengeToken: string }).challengeToken),
        });
        return;
      }

      if (payload && typeof payload === 'object' && 'user' in payload) {
        await completeLogin((payload as { user: SessionUser }).user);
      }
    } finally {
      setPending(false);
    }
  }

  async function onVerify(values: TwoFactorValues) {
    if (!challenge) {
      return;
    }
    setFormError(null);
    setPending(true);
    try {
      const response = await fetch('/api/session/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: values.code,
          challengeToken: challenge.challengeToken,
        }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        if (isApiErrorBody(payload)) {
          setFormError(payload.message || 'Invalid authentication code.');
        } else {
          setFormError('Unable to verify the code. Please try again.');
        }
        return;
      }
      if (payload && typeof payload === 'object' && 'user' in payload) {
        await completeLogin((payload as { user: SessionUser }).user);
      }
    } finally {
      setPending(false);
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
        {formError ? (
          <Alert variant="danger" className={`mb-4 ${motion.errorIn}`} aria-live="polite">
            {formError}
          </Alert>
        ) : null}

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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                setFormError(null);
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
