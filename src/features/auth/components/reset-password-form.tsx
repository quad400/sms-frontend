'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '../schemas/auth-schemas';
import { api } from '@/lib/api/client';
import { isApiErrorBody } from '@/lib/api/errors';
import { motion } from '@/lib/motion/classes';

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const password = form.watch('newPassword');
  const strength = useMemo(() => passwordStrength(password || ''), [password]);

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setError('This reset link is missing a token. Request a new link.');
      return;
    }
    setError(null);
    setPending(true);
    try {
      const { error: apiError, response } = await api.POST('/api/v1/auth/password/reset', {
        body: { token, newPassword: values.newPassword },
      });
      if (!response.ok) {
        const body: unknown = apiError;
        if (isApiErrorBody(body)) {
          setError(
            body.code.includes('TOKEN') || body.code.includes('EXPIRED')
              ? 'This reset link has expired. Request a new one.'
              : body.message,
          );
        } else {
          setError('Unable to reset the password. Please try again.');
        }
        return;
      }
      router.replace('/login?reset=1');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className={`w-full max-w-md ${motion.pageEnter}`}>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Use at least 8 characters. Mix letters, numbers, and symbols.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="danger" className={`mb-4 ${motion.errorIn}`} aria-live="polite">
            {error}{' '}
            <Link href="/forgot-password" className="underline">
              Request a new link
            </Link>
          </Alert>
        ) : null}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...form.register('newPassword')}
            />
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < strength ? 'bg-brand' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>At least 8 characters</li>
              <li>Upper and lower case letters</li>
              <li>A number and a symbol</li>
            </ul>
            {form.formState.errors.newPassword ? (
              <p className="text-xs text-danger">{form.formState.errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
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
          <Button type="submit" className="w-full" disabled={pending || !token}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
