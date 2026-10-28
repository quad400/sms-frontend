export const ADMISSION_STEPS = [
  'details',
  'guardian',
  'enrolment',
  'medical',
  'done',
] as const;

export type AdmissionStep = (typeof ADMISSION_STEPS)[number];

export const ADMISSION_STEP_META: Record<
  AdmissionStep,
  { label: string; description: string; permission?: string }
> = {
  details: {
    label: 'Student',
    description: 'Personal details and campus',
    permission: 'students.student.create',
  },
  guardian: {
    label: 'Guardian',
    description: 'Primary contact and relationship',
    permission: 'students.guardian.update',
  },
  enrolment: {
    label: 'Enrolment',
    description: 'Session and class placement',
    permission: 'students.enrolment.list',
  },
  medical: {
    label: 'Medical',
    description: 'Allergies and health notes',
    permission: 'students.medical.update',
  },
  done: {
    label: 'Done',
    description: 'Review and finish',
  },
};

export function parseAdmissionStep(value: string | null): AdmissionStep {
  if (value && (ADMISSION_STEPS as readonly string[]).includes(value)) {
    return value as AdmissionStep;
  }
  return 'details';
}

export function nextAdmissionStep(step: AdmissionStep): AdmissionStep | null {
  const i = ADMISSION_STEPS.indexOf(step);
  if (i < 0 || i >= ADMISSION_STEPS.length - 1) return null;
  return ADMISSION_STEPS[i + 1]!;
}

export function prevAdmissionStep(step: AdmissionStep): AdmissionStep | null {
  const i = ADMISSION_STEPS.indexOf(step);
  if (i <= 0) return null;
  return ADMISSION_STEPS[i - 1]!;
}
