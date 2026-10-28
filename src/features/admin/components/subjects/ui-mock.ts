/**
 * Presentational placeholders for Academic Subjects & Syllabus UI shell.
 * Replace when department / syllabus / specialist APIs land.
 */

export const SUBJECTS_UI_MOCK = {
  summary: {
    junior: 14,
    senior: 14,
    coreCompulsory: 8,
    coreExamples: 'Math, Eng, Civic, Sci',
    facultySpecialists: 52,
    staffedPct: 100,
    syllabusCompletion: 76.4,
    weekTarget: 75,
  },
  departments: [
    { id: '', label: 'All Departments' },
    { id: 'sciences', label: 'Sciences & Math' },
    { id: 'languages', label: 'Languages' },
    { id: 'humanities', label: 'Humanities' },
    { id: 'vocational', label: 'Vocational & ICT' },
  ],
  tiers: [
    { value: '', label: 'Tier: All' },
    { value: 'core', label: 'Compulsory Core' },
    { value: 'elective', label: 'Elective' },
    { value: 'enrichment', label: 'Enrichment' },
  ],
  leads: [
    { name: 'Dr. K. Balogun', title: 'HOD Mathematics' },
    { name: 'Mrs. A. Okeke', title: 'Senior Specialist' },
    { name: 'Mr. T. Adeyemi', title: 'Lead Teacher' },
    { name: 'Ms. F. Bello', title: 'Subject Lead' },
  ],
  textbooks: [
    'New General Mathematics for Secondary Schools',
    'Essential Mathematics Practice Workbook',
    'Casio fx-991EX ClassWiz (prescribed)',
  ],
  facultyRoster: [
    { name: 'Mr. C. Okonjo', role: 'Form Tutor · JSS 1A, 1B' },
    { name: 'Mrs. N. Eze', role: 'Specialist · JSS 2–3' },
    { name: 'Dr. K. Balogun', role: 'Lead · SSS streams' },
  ],
  grading: [
    { id: 'ca1', label: 'CA 1 Test', pct: 20, barClass: 'bg-sky-500' },
    { id: 'ca2', label: 'CA 2 Midterm', pct: 20, barClass: 'bg-teal-500' },
    { id: 'prac', label: 'Practical / Lab', pct: 10, barClass: 'bg-amber-500' },
    { id: 'exam', label: 'Terminal Exam', pct: 50, barClass: 'bg-slate-700' },
  ],
  pacingNote:
    'Teacher logs indicate Physics and Further Math are behind Week 8 targets — flagged for remedial review.',
} as const;

const DEPT_IDS = ['sciences', 'languages', 'humanities', 'vocational'] as const;
const DEPT_LABEL: Record<(typeof DEPT_IDS)[number], string> = {
  sciences: 'Sciences & Math',
  languages: 'Languages',
  humanities: 'Humanities',
  vocational: 'Vocational & ICT',
};

export function subjectExtraForId(id: number, code?: string) {
  const deptId = DEPT_IDS[id % DEPT_IDS.length]!;
  const lead = SUBJECTS_UI_MOCK.leads[id % SUBJECTS_UI_MOCK.leads.length]!;
  const periods = 3 + (id % 4);
  const syllabusPct = 62 + ((id * 7) % 30);
  const tier =
    /mth|eng|civic|sci|math|english/i.test(`${code ?? ''} ${id}`) || id % 3 === 0
      ? ('core' as const)
      : id % 3 === 1
        ? ('elective' as const)
        : ('enrichment' as const);
  const levelSpan =
    deptId === 'vocational'
      ? 'SSS 1 – SSS 3'
      : deptId === 'languages'
        ? 'JSS 1 – SSS 2'
        : 'JSS 1 – SSS 3';
  return {
    departmentId: deptId,
    department: DEPT_LABEL[deptId],
    lead,
    periods,
    syllabusPct,
    tier,
    levelSpan,
    compulsory: tier === 'core',
  };
}
