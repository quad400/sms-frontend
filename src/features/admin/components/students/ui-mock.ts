/**
 * Presentational placeholders for the Students directory UI shell.
 * Replace with real aggregates when backend summary endpoints are ready.
 */

export const STUDENTS_UI_MOCK = {
  description: 'Directory and master enrolments across all campuses and active cohorts.',
  sessionLabel: '2024/2025 Session',
  summary: {
    totalEnrolled: 1420,
    totalDelta: '+14 this term',
    male: 728,
    female: 692,
    boarding: 480,
    day: 940,
    attendanceRate: 96.4,
    attendanceDelta: '+0.8% MoM',
  },
  statusTabs: [
    { value: 'active', label: 'Active', count: 1412, tone: 'active' as const },
    { value: 'inactive', label: 'On Leave', count: 5, tone: 'muted' as const },
    { value: 'withdrawn', label: 'Suspended', count: 3, tone: 'danger' as const },
  ],
  capacity: [
    { id: 'jss1', label: 'JSS 1', arms: 4, enrolled: 118, capacity: 120 },
    { id: 'jss2', label: 'JSS 2', arms: 4, enrolled: 112, capacity: 120 },
    { id: 'jss3', label: 'JSS 3', arms: 3, enrolled: 121, capacity: 120 },
    { id: 'sss1', label: 'SSS 1', arms: 4, enrolled: 98, capacity: 120 },
    { id: 'sss2', label: 'SSS 2', arms: 3, enrolled: 94, capacity: 110 },
    { id: 'sss3', label: 'SSS 3', arms: 3, enrolled: 88, capacity: 110 },
  ],
  houses: [
    { id: 1, name: 'Volta', count: 364, colour: '#10b981', placeLabel: 'Leading points' },
    { id: 2, name: 'Niger', count: 355, colour: '#3b82f6', placeLabel: '2nd place' },
    { id: 3, name: 'Benue', count: 351, colour: '#eab308', placeLabel: '3rd place' },
    { id: 4, name: 'Ogun', count: 350, colour: '#ef4444', placeLabel: '4th place' },
  ],
} as const;
