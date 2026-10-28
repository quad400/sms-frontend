/**
 * Presentational placeholders for the Staff directory UI shell.
 * Replace with real aggregates when backend summary endpoints are ready.
 */

export const STAFF_UI_MOCK = {
  sessionLabel: 'Academic Session 2024/2025 · Term 2 Active',
  summary: {
    total: 68,
    teaching: 52,
    nonTeaching: 16,
    onDuty: 64,
    presentPct: 94.1,
    leaveApproved: 4,
    studentStaffRatio: '20.8 : 1',
    ratioNote: 'Ministry Benchmark Met',
    functionalUnits: 8,
    campuses: 2,
  },
  categoryTabs: [
    { value: '', label: 'All Staff', count: 68 },
    { value: 'teaching', label: 'Teaching Faculty', count: 52 },
    { value: 'admin', label: 'Administrative', count: 9 },
    { value: 'support', label: 'Support & Health', count: 7 },
  ],
  departments: [
    { id: 'math', label: 'Mathematics' },
    { id: 'science', label: 'Sciences' },
    { id: 'languages', label: 'Foreign Languages' },
    { id: 'humanities', label: 'Humanities' },
    { id: 'ict', label: 'ICT' },
    { id: 'registry', label: 'Registry' },
    { id: 'health', label: 'Health' },
  ],
  employmentTypes: [
    { value: '', label: 'Employment: All' },
    { value: 'full_time', label: 'Full-Time' },
    { value: 'adjunct', label: 'Adjunct' },
    { value: 'contract', label: 'Contract' },
  ],
  /** Demo enrichment keyed loosely by staff index for table presentation. */
  rowExtras: [
    {
      department: 'Mathematics',
      designation: 'Senior Master & Form Tutor',
      classLabel: 'JSS 2A',
      subjects: 'Pure Math, Further Math, Basic Science',
      periods: 18,
      periodCap: 22,
      statusToday: { kind: 'checked_in' as const, label: 'Checked In 07:15 AM' },
      contract: 'Full-Time',
    },
    {
      department: 'Sciences',
      designation: 'HOD Sciences',
      classLabel: 'SSS 1A',
      subjects: 'Physics, Chemistry',
      periods: 16,
      periodCap: 22,
      statusToday: { kind: 'duty' as const, label: 'Official Duty (ICT Expo)' },
      contract: 'Full-Time',
    },
    {
      department: 'Foreign Languages',
      designation: 'Language Teacher',
      classLabel: null,
      subjects: 'French Lang & DELF Prep',
      periods: 10,
      periodCap: 12,
      statusToday: { kind: 'checked_in' as const, label: 'In 07:40 AM' },
      contract: 'Adjunct',
    },
    {
      department: 'Health',
      designation: 'School Nurse',
      classLabel: null,
      subjects: 'Clinic & Health Education',
      periods: null,
      periodCap: null,
      shiftHours: 40,
      statusToday: { kind: 'leave' as const, label: 'On Medical Leave' },
      contract: 'Full-Time',
    },
  ],
  distribution: [
    { id: 'sci', label: 'Sciences & Mathematics', count: 22, pct: 32.3, barClass: 'bg-teal-600' },
    { id: 'hum', label: 'Humanities', count: 14, pct: 20.6, barClass: 'bg-sky-500' },
    { id: 'ict', label: 'ICT', count: 9, pct: 13.2, barClass: 'bg-cyan-400' },
    { id: 'reg', label: 'Registry', count: 8, pct: 11.8, barClass: 'bg-slate-400' },
    { id: 'hlt', label: 'Health', count: 5, pct: 7.4, barClass: 'bg-amber-700' },
  ],
  retentionRate: 96.2,
  workload: {
    utilisationPct: 78,
    targetPct: 80,
    avgPeriods: 17.2,
    maxCap: 22,
    overCapacity: 0,
    optimal: 48,
    specialized: 4,
  },
} as const;

export type StaffRowExtra = (typeof STAFF_UI_MOCK.rowExtras)[number];

export function staffExtraForIndex(index: number): StaffRowExtra {
  const extras = STAFF_UI_MOCK.rowExtras;
  return extras[index % extras.length]!;
}
