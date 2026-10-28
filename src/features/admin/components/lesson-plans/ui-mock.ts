/**
 * Presentational placeholders for Curriculum & Lesson Plan Vetting UI.
 * Replace when pacing / department / document APIs land.
 */

export const LESSON_PLANS_UI_MOCK = {
  pacingLabel: 'Academic Governance · Term 2 Pacing',
  summary: {
    submissionRate: 94.1,
    submissionDelta: '+3.2% vs Wk 7',
    awaiting: 6,
    awaitingCutoff: 'Requires review cutoff 16:00',
    approved: 43,
    overdue: 3,
    overdueNote: 'Escalation Protocol: Active Notice',
    reminders: 3,
  },
  departments: [
    { value: '', label: 'All Departments' },
    { value: 'sciences', label: 'Sciences & Math' },
    { value: 'languages', label: 'Languages' },
    { value: 'humanities', label: 'Humanities' },
  ],
  stages: [
    { value: '', label: 'Junior & Senior Secondary' },
    { value: 'jss', label: 'Junior Secondary' },
    { value: 'ss', label: 'Senior Secondary' },
  ],
  roles: [
    'English Teacher · Languages',
    'Mathematics Specialist · Sciences',
    'Physics Tutor · Sciences',
    'Civic Educator · Humanities',
    'ICT Lead · Vocational',
  ],
  topics: [
    { title: 'Narrative Writing & Cohesion', blurb: 'Discourse markers · peer review' },
    { title: 'Quadratic Equations', blurb: 'Factorisation · word problems' },
    { title: 'Forces & Motion', blurb: 'Lab demo · Newton’s laws' },
    { title: 'Civic Responsibility', blurb: 'Community service case study' },
  ],
  docs: ['LP_ENG_W8.pdf', 'LP_MTH_W8.docx', 'LP_PHY_W8.pdf', 'LP_CIV_W8.pdf'],
} as const;

export type LessonPlanUiStatus =
  | 'pending'
  | 'approved'
  | 'revision'
  | 'overdue'
  | 'draft';

export function lessonPlanExtraForId(id: number, status?: string) {
  const roles = LESSON_PLANS_UI_MOCK.roles;
  const topics = LESSON_PLANS_UI_MOCK.topics;
  const docs = LESSON_PLANS_UI_MOCK.docs;
  const role = roles[id % roles.length]!;
  const topic = topics[id % topics.length]!;
  const doc = docs[id % docs.length]!;

  const raw = (status ?? '').toLowerCase();
  let uiStatus: LessonPlanUiStatus = 'pending';
  let submittedLabel = 'On-time (Pacing aligned)';
  if (raw.includes('approv')) {
    uiStatus = 'approved';
    submittedLabel = id % 2 === 0 ? 'Early submission' : 'On-time (Pacing aligned)';
  } else if (raw.includes('draft')) {
    uiStatus = 'draft';
    submittedLabel = 'Draft · not submitted';
  } else if (raw.includes('reject') || raw.includes('revision')) {
    uiStatus = 'revision';
    submittedLabel = 'Expedited';
  } else if (id % 7 === 0) {
    uiStatus = 'overdue';
    submittedLabel = 'Overdue (28 hrs)';
  } else if (raw.includes('submit') || !raw) {
    uiStatus = 'pending';
  }

  const hoursAgo = 2 + (id % 40);
  const submittedAt =
    uiStatus === 'draft'
      ? '—'
      : hoursAgo < 24
        ? `${hoursAgo}h ago`
        : `${Math.floor(hoursAgo / 24)}d ago`;

  return { role, topic, doc, uiStatus, submittedLabel, submittedAt };
}

export function hodBadge(uiStatus: LessonPlanUiStatus): {
  label: string;
  variant: 'warning' | 'successSoft' | 'dangerSoft' | 'secondary' | 'info';
} {
  switch (uiStatus) {
    case 'approved':
      return { label: 'Approved', variant: 'successSoft' };
    case 'revision':
      return { label: 'Revision Requested', variant: 'dangerSoft' };
    case 'overdue':
      return { label: 'Flagged Overdue', variant: 'dangerSoft' };
    case 'draft':
      return { label: 'Draft', variant: 'secondary' };
    default:
      return { label: 'Pending HOD Review', variant: 'warning' };
  }
}
