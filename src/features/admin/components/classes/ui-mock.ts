/**
 * Legacy placeholders still used by the full class profile page until those
 * surfaces have dedicated endpoints (attendance, GPA, capacity).
 */

export function classExtraForId(id: number) {
  const divisions = [
    { id: 'junior', label: 'Junior Basic', variant: 'info' as const },
    { id: 'science', label: 'Science Core', variant: 'soft' as const },
    { id: 'arts', label: 'Arts & Humanities', variant: 'warning' as const },
    { id: 'primary', label: 'Primary Stream', variant: 'successSoft' as const },
  ];
  const homerooms = ['B-102 (Main)', 'A-014 (West)', 'C-201 (Main)', 'Lab-3 (Science)', 'D-110 (East)'];
  const prefects = ['Adaobi Nwosu', 'Chinedu Eze', 'Fatima Bello', 'Tunde Adeyemi', 'Grace Okoro'];
  const departments = ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'ICT'];
  const capacity = 40;
  const enrolled = capacity - ((id * 3) % 7) + (id % 5 === 0 ? 2 : 0);
  return {
    division: divisions[id % divisions.length]!,
    homeroom: homerooms[id % homerooms.length]!,
    prefect: prefects[id % prefects.length]!,
    department: departments[id % departments.length]!,
    capacity,
    enrolled,
  };
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
