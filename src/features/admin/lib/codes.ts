/** Interim code lists until GET /lookups exists. Use string codes, never invent ids. */

export const GENDER_CODES = [
  { code: 'male', label: 'Male' },
  { code: 'female', label: 'Female' },
  { code: 'other', label: 'Other' },
] as const;

export const STUDENT_STATUS_CODES = [
  { code: 'active', label: 'Active' },
  { code: 'inactive', label: 'Inactive' },
  { code: 'transferred', label: 'Transferred' },
  { code: 'graduated', label: 'Graduated' },
  { code: 'withdrawn', label: 'Withdrawn' },
] as const;

export const STAFF_STATUS_CODES = [
  { code: 'active', label: 'Active' },
  { code: 'inactive', label: 'Inactive' },
] as const;

export const PROMOTION_OUTCOMES = [
  { code: 'promoted', label: 'Promoted' },
  { code: 'repeated', label: 'Repeated' },
  { code: 'graduated', label: 'Graduated' },
  { code: 'withdrawn', label: 'Withdrawn' },
] as const;

export const TRANSFER_TYPE_CODES = [
  { code: 'internal', label: 'Internal campus' },
  { code: 'external', label: 'External school' },
] as const;

/** Interim until GET /lookups exists. */
export const RELATIONSHIP_CODES = [
  { code: 'father', label: 'Father' },
  { code: 'mother', label: 'Mother' },
  { code: 'guardian', label: 'Guardian' },
  { code: 'sibling', label: 'Sibling' },
  { code: 'other', label: 'Other' },
] as const;

/** Interim until GET /lookups exists. */
export const JOB_TITLE_CODES = [
  { code: 'teacher', label: 'Teacher' },
  { code: 'senior_master', label: 'Senior Master' },
  { code: 'hod', label: 'Head of Department' },
  { code: 'form_tutor', label: 'Form Tutor' },
  { code: 'admin', label: 'Administrator' },
  { code: 'accountant', label: 'Accountant' },
  { code: 'nurse', label: 'School Nurse' },
  { code: 'support', label: 'Support Staff' },
  { code: 'other', label: 'Other' },
] as const;

export function labelForCode(
  codes: ReadonlyArray<{ code: string; label: string }>,
  code: string | null | undefined,
): string {
  if (!code) return '—';
  return codes.find((c) => c.code === code)?.label ?? code;
}
