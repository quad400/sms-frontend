export const STATUS_TABS = [
  { value: 'active', label: 'Active', tone: 'active' as const },
  { value: 'suspended', label: 'Suspended', tone: 'danger' as const },
  { value: 'withdrawn', label: 'Withdrawn', tone: 'muted' as const },
  { value: 'transferred', label: 'Transferred', tone: 'muted' as const },
  { value: 'graduated', label: 'Graduated', tone: 'muted' as const },
  { value: 'applicant', label: 'Applicant', tone: 'muted' as const },
] as const;

export type StudentStatusTab = {
  value: string;
  label: string;
  count: number;
  tone: 'active' | 'danger' | 'muted';
};
