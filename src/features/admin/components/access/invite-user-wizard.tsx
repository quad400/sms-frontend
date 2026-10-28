'use client';

import { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useCreateUser } from '../../hooks/use-users';
import { ACCESS_UI_MOCK } from './ui-mock';

const STEPS = [
  { id: 1, label: 'Identity & Contact' },
  { id: 2, label: 'Role & Allocation' },
  { id: 3, label: 'Security & MFA Policy' },
] as const;

export function InviteUserWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleCard, setRoleCard] = useState<string>(ACCESS_UI_MOCK.inviteRoles[0]!.id);
  const create = useCreateUser();

  const selectedRole = useMemo(
    () => ACCESS_UI_MOCK.inviteRoles.find((r) => r.id === roleCard) ?? ACCESS_UI_MOCK.inviteRoles[0]!,
    [roleCard],
  );

  const staffCode = useMemo(() => {
    const n = Math.floor(80 + Math.random() * 20);
    return `STA-T-0${n}`;
  }, [open]);

  const reset = () => {
    setStep(1);
    setDisplayName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRoleCard(ACCESS_UI_MOCK.inviteRoles[0]!.id);
  };

  const submit = () => {
    if (!displayName.trim() || !password.trim()) {
      toastError('Missing fields', 'Display name and temporary password are required.');
      setStep(1);
      return;
    }
    create.mutate(
      {
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        type: selectedRole.type,
      },
      {
        onSuccess: () => {
          toastSuccess('Invitation dispatched', 'User will receive onboarding link (48h).');
          onOpenChange(false);
          reset();
        },
        onError: (e) => toastError('Could not provision user', e.message),
      },
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
          Secured Enterprise Directory Provisioning · ISO/IEC 27001 · ID: AUTH-PROV-2025-084
        </p>
        <SheetHeader className="mt-2 text-left">
          <SheetTitle>Provision New Portal User Account</SheetTitle>
          <SheetDescription>
            Issue official scholastic credentials and configure granular role-based permissions
            across campuses.
          </SheetDescription>
        </SheetHeader>

        <nav className="mt-4 flex gap-2" aria-label="Provisioning steps">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={cn(
                  'flex flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : done
                      ? 'bg-teal-50 text-teal-900'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                    active ? 'bg-white/20' : done ? 'bg-teal-700 text-white' : 'bg-background',
                  )}
                >
                  {done ? <CheckCircle2 className="size-3.5" /> : s.id}
                </span>
                <span className="hidden font-semibold sm:inline">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-5 flex-1 space-y-5">
          {step === 1 ? (
            <section className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Account Identity & Verified Reach
              </h3>
              <div className="grid gap-1.5">
                <Label required>Full legal name & title</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. Ngozi Eunice Adeleke"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Official institutional email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                />
                <p className="text-[11px] text-muted-foreground">
                  Auto-verified domain · federated with Google Workspace SSO when enabled.
                </p>
              </div>
              <div className="grid gap-1.5">
                <Label>Faculty / staff identifier</Label>
                <div className="flex gap-2">
                  <Input value={staffCode} readOnly className="font-mono" />
                  <Badge variant="successSoft" size="sm" className="shrink-0 self-center">
                    Auto-generated
                  </Badge>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Primary mobile phone</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 …"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>Temporary password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password"
                  autoComplete="new-password"
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Assign Primary Security Privilege Role
                </h3>
                <span className="text-[11px] font-semibold text-teal-700">
                  View Matrix Perms (48/48)
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ACCESS_UI_MOCK.inviteRoles.map((r) => {
                  const active = r.id === roleCard;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setRoleCard(r.id)}
                        className={cn(
                          'h-full w-full rounded-xl border p-3 text-left transition',
                          active
                            ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                            : 'border-border bg-card hover:border-teal-200',
                        )}
                      >
                        {active ? (
                          <Badge variant="successSoft" size="sm" className="mb-2">
                            Active selection
                          </Badge>
                        ) : null}
                        <p className="text-sm font-semibold">{r.title}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{r.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {r.tags.map((t) => (
                            <Badge key={t} variant="secondary" size="sm">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Security & MFA Policy
              </h3>
              <p className="text-sm text-muted-foreground">
                Account type: <span className="font-semibold text-foreground">{selectedRole.type}</span>.
                MFA will be enforced on first login for admin and bursary roles. Invitation link
                expires in 48 hours.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="rounded-lg border border-border bg-background px-3 py-2">
                  Require password rotation within 30 days
                </li>
                <li className="rounded-lg border border-border bg-background px-3 py-2">
                  Enforce re-authentication on grading & fee overrides
                </li>
                <li className="rounded-lg border border-border bg-background px-3 py-2">
                  Account lockout after 5 failed attempts
                </li>
              </ul>
            </section>
          ) : null}
        </div>

        <p className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground">
          <Mail className="mt-0.5 size-3.5 shrink-0" />
          User will receive an onboarding invitation link valid for 48 hours.
        </p>

        <SheetFooter className="mt-4 flex-row flex-wrap gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel & Discard
          </Button>
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < 3 ? (
            <Button
              type="button"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled>
                <Bookmark className="size-4" />
                Save Draft
              </Button>
              <Button
                type="button"
                className="bg-teal-700 hover:bg-teal-800"
                disabled={create.isPending}
                onClick={submit}
              >
                <KeyRound className="size-4" />
                {create.isPending ? 'Dispatching…' : 'Dispatch Invitation & Credentials'}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
