/**
 * Presentational placeholders for Master Scheduling UI shell.
 * Replace when live period / clash / saturation APIs land.
 */

export const TIMETABLES_UI_MOCK = {
  engineBadge: 'Live Sync Engine v4.8',
  summary: {
    termLabel: 'Term 2 26/27',
    weekLabel: 'Week 7 Active · Cycle Day 3',
    periodsFilled: '216 / 216',
    periodsNote: '100% Filled across 36 Class Arms',
    collisions: 0,
    collisionMode: 'Strict Mode',
    facilitySaturation: 91.2,
  },
  live: {
    period: 'Period 2',
    subject: 'Basic Science',
    className: 'JSS 1A',
    faculty: 'Dr. A. Ezenwa',
    room: 'Science Lab 2',
    present: 28,
    timeRange: '09:00 – 09:45 AM',
    remaining: '24 mins remaining',
  },
  conflicts: [
    { id: 'limits', label: 'Teacher Daily Limits', status: 'ok' as const, detail: '100% Ok · ≤ 4 contact periods' },
    { id: 'labs', label: 'Specialized Lab Saturation', status: 'warn' as const, detail: '91.2% Cap · limited slots' },
    { id: 'double', label: 'Double-Period Grouping', status: 'ok' as const, detail: 'Optimal · labs mapped contiguously' },
    { id: 'tutor', label: 'Form Tutor Presence', status: 'ok' as const, detail: 'Covered · morning assembly' },
  ],
  footer: {
    assigned: 35,
    stem: 14,
    stemPct: 40,
    electives: 8,
  },
  /** Demo period cells keyed loosely by weekday index × slot index */
  demoSubjects: [
    { code: 'ENG', name: 'English Studies', teacher: 'FA', room: 'B-102', live: true },
    { code: 'MTH', name: 'Mathematics', teacher: 'KB', room: 'A-014', live: false },
    { code: 'BSC', name: 'Basic Science', teacher: 'AE', room: 'Lab-2', live: false },
    { code: 'CIV', name: 'Civic Education', teacher: 'NO', room: 'C-201', live: false },
    { code: 'ICT', name: 'Computer Studies', teacher: 'TA', room: 'ICT-1', live: false },
    { code: 'FRN', name: 'French', teacher: 'FB', room: 'D-110', live: false },
  ],
} as const;

export const WEEKDAY_ROWS = [
  { id: 'monday', label: 'Monday', day: 'Day 1' },
  { id: 'tuesday', label: 'Tuesday', day: 'Day 2' },
  { id: 'wednesday', label: 'Wednesday', day: 'Day 3' },
  { id: 'thursday', label: 'Thursday', day: 'Day 4' },
  { id: 'friday', label: 'Friday', day: 'Day 5' },
] as const;

export function demoCell(dayIndex: number, slotIndex: number) {
  const items = TIMETABLES_UI_MOCK.demoSubjects;
  return items[(dayIndex * 3 + slotIndex) % items.length]!;
}
