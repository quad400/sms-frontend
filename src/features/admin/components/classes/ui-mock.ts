/**
 * Presentational placeholders for Class Management UI shell.
 * Replace with real aggregates when class capacity / homeroom APIs land.
 */

export const CLASSES_UI_MOCK = {
  defaultCapacity: 40,
  summary: {
    capPct: 97.9,
    coverageNote: 'JSS 1 through SSS 3 coverage',
    avgDensity: '39.4 / 40.0',
    densityNote: 'Optimal Teacher:Pupil ratio',
    formMasterPct: 100,
    formMasterUnassigned: 0,
    homeroomReady: '36 / 36',
    homeroomNote: 'Physical lock & key assignment complete',
  },
  divisions: [
    { id: 'junior', label: 'Junior Basic', variant: 'info' as const },
    { id: 'science', label: 'Science Core', variant: 'soft' as const },
    { id: 'arts', label: 'Arts & Humanities', variant: 'warning' as const },
    { id: 'primary', label: 'Primary Stream', variant: 'successSoft' as const },
  ],
  homerooms: ['B-102 (Main)', 'A-014 (West)', 'C-201 (Main)', 'Lab-3 (Science)', 'D-110 (East)'],
  prefects: ['Adaobi Nwosu', 'Chinedu Eze', 'Fatima Bello', 'Tunde Adeyemi', 'Grace Okoro'],
  departments: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'ICT'],
} as const;

export type DivisionMeta = (typeof CLASSES_UI_MOCK.divisions)[number];

export function classExtraForId(id: number) {
  const { divisions, homerooms, prefects, departments, defaultCapacity } = CLASSES_UI_MOCK;
  const division = divisions[id % divisions.length]!;
  const homeroom = homerooms[id % homerooms.length]!;
  const prefect = prefects[id % prefects.length]!;
  const department = departments[id % departments.length]!;
  const capacity = defaultCapacity;
  // Deterministic enrolled count near capacity for table coloring demos.
  const enrolled = capacity - ((id * 3) % 7) + ((id % 5 === 0) ? 2 : 0);
  return { division, homeroom, prefect, department, capacity, enrolled };
}

export function rosterExtraForIndex(index: number) {
  const statuses = [
    { kind: 'present' as const, label: 'Present' },
    { kind: 'present' as const, label: 'Present' },
    { kind: 'excused' as const, label: 'Excused' },
    { kind: 'present' as const, label: 'Present' },
  ];
  const status = statuses[index % statuses.length]!;
  const gpa = (3.2 + ((index * 17) % 80) / 100).toFixed(2);
  const attendance = (88 + ((index * 13) % 12) + (index % 10) / 10).toFixed(1);
  return { status, gpa, attendance: Number(attendance) };
}

export function genderSplit(total: number) {
  const boys = Math.round(total * 0.55);
  return {
    boys,
    girls: Math.max(0, total - boys),
    boarders: Math.round(total * 0.35),
    dayScholars: Math.max(0, total - Math.round(total * 0.35)),
  };
}
