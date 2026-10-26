export const OTHER_REASON = 'Other';
export const ABSENCE_REASONS = [
  'Feeling unwell',
  'Appointment',
  'Family matter',
  'Medical Clearance / Clinic Visit',
  OTHER_REASON,
] as const;

export const REASON_MAX = 500;
export const NOTE_MAX = 1000;
export const MESSAGE_MAX = 2000;

export const FIELD_CLASS =
  'flex w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function requestErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
