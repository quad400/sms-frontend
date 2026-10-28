export const ONBOARDING_STEPS = [
  'details',
  'contact',
  'allocations',
  'done',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_STEP_META: Record<
  OnboardingStep,
  { label: string; description: string; permission?: string }
> = {
  details: {
    label: 'Details',
    description: 'Personal info, role, campus',
    permission: 'staff.staff.create',
  },
  contact: {
    label: 'Contact',
    description: 'Phone, email, hire date',
    permission: 'staff.staff.update',
  },
  allocations: {
    label: 'Allocations',
    description: 'Classes and subjects',
    permission: 'staff.allocation.update',
  },
  done: {
    label: 'Done',
    description: 'Review and finish',
  },
};

export function parseOnboardingStep(value: string | null): OnboardingStep {
  if (value && (ONBOARDING_STEPS as readonly string[]).includes(value)) {
    return value as OnboardingStep;
  }
  return 'details';
}

export function nextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const i = ONBOARDING_STEPS.indexOf(step);
  if (i < 0 || i >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[i + 1]!;
}

export function prevOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const i = ONBOARDING_STEPS.indexOf(step);
  if (i <= 0) return null;
  return ONBOARDING_STEPS[i - 1]!;
}
