'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from '@/lib/motion/classes';
import { toastSuccess } from '@/lib/toast';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await forgotPassword.mutateAsync({ email: values.email });
    } catch {
      // Always show the same success copy to avoid account enumeration.
    }
    toastSuccess('Check your email', 'If an account exists, we sent reset instructions.');
    form.reset();
  }

  return (
    <Card className={`w-full max-w-md ${motion.pageEnter}`}>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We will email reset instructions if an account exists.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={forgotPassword.isPending}>
            {forgotPassword.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-brand hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
