'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export type AdminWizardStepMeta = {
  id: string;
  label: string;
  description: string;
  locked?: boolean;
  reachable?: boolean;
};

export function AdminWizardShell({
  backHref,
  backLabel,
  title,
  description,
  titleAddon,
  steps,
  activeStep,
  onStepChange,
  children,
  showStepBack,
  onStepBack,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  titleAddon?: React.ReactNode;
  steps: AdminWizardStepMeta[];
  activeStep: string;
  onStepChange: (stepId: string) => void;
  children: React.ReactNode;
  showStepBack?: boolean;
  onStepBack?: () => void;
}) {
  const activeIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <div className="mx-auto space-y-5">
      <div className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          {backLabel}
        </Link>
        <PageHeader title={title} description={description} titleAddon={titleAddon} />
      </div>

      <nav
        className="flex flex-wrap justify-between gap-1.5 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]"
        aria-label="Wizard steps"
      >
        {steps.map((s, index) => {
          const active = s.id === activeStep;
          const done = activeIndex >= 0 && index < activeIndex;
          const locked = !!s.locked;
          const reachable = s.reachable !== false;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!reachable || (locked && s.id !== 'done')}
              onClick={() => {
                if (!reachable) return;
                if (locked && s.id !== 'done') return;
                onStepChange(s.id);
              }}
              className={cn(
                'inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition sm:flex-none',
                active
                  ? 'bg-teal-700 text-white'
                  : done
                    ? 'bg-teal-50 text-teal-900 hover:bg-teal-100'
                    : 'text-muted-foreground hover:bg-muted',
                locked && !active ? 'opacity-60' : null,
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  active
                    ? 'bg-white/20 text-white'
                    : done
                      ? 'bg-teal-700 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {locked && s.id !== 'done' ? (
                  <Lock className="size-3" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{s.label}</span>
                <span
                  className={cn(
                    'hidden truncate text-[11px] sm:block',
                    active ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {s.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {showStepBack && onStepBack ? (
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onStepBack}>
            Back
          </Button>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function AdminWizardStepCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      {title || description ? (
        <div className="mb-5 space-y-1">
          {title ? (
            <h2 className="font-heading text-base font-semibold tracking-tight">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function WizardDone({
  title,
  description,
  summary,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  onAnother,
  anotherLabel,
}: {
  title: string;
  description: string;
  summary?: React.ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  onAnother?: () => void;
  anotherLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-5 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <CheckCircle2 className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {summary}
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-teal-700 hover:bg-teal-800">
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
        {onAnother ? (
          <Button type="button" variant="outline" onClick={onAnother}>
            {anotherLabel ?? 'Create another'}
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
