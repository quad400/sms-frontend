type Params = Record<string, string | number | undefined>;

export const staffKeys = {
  all: ['staff'] as const,
  me: () => [...staffKeys.all, 'me'] as const,
  overview: () => [...staffKeys.all, 'overview'] as const,
  allocations: () => [...staffKeys.all, 'allocations'] as const,

  classes: () => [...staffKeys.all, 'classes'] as const,
  subjects: () => [...staffKeys.all, 'subjects'] as const,
  terms: () => [...staffKeys.all, 'terms'] as const,
  timeSlots: () => [...staffKeys.all, 'time-slots'] as const,
  rooms: () => [...staffKeys.all, 'rooms'] as const,
  students: (classId: number, page?: number) =>
    [...staffKeys.all, 'students', classId, page ?? 1] as const,
  studentCount: (classId: number) => [...staffKeys.all, 'student-count', classId] as const,

  timetables: (params: Params) => [...staffKeys.all, 'timetables', params] as const,
  timetable: (id: number) => [...staffKeys.all, 'timetable', id] as const,

  registers: (params: Params) => [...staffKeys.all, 'registers', params] as const,
  register: (id: number) => [...staffKeys.all, 'register', id] as const,
  attendanceSummary: (classId: number, from: string, to: string) =>
    [...staffKeys.all, 'attendance-summary', classId, from, to] as const,

  assessments: (params: Params) => [...staffKeys.all, 'assessments', params] as const,
  assessment: (id: number) => [...staffKeys.all, 'assessment', id] as const,
  scores: (assessmentId: number) => [...staffKeys.all, 'scores', assessmentId] as const,
  scoreCount: (assessmentId: number) => [...staffKeys.all, 'score-count', assessmentId] as const,
  resultSheets: (params: Params) => [...staffKeys.all, 'result-sheets', params] as const,

  lessonPlans: (params: Params) => [...staffKeys.all, 'lesson-plans', params] as const,
  lessonNotes: (params: Params) => [...staffKeys.all, 'lesson-notes', params] as const,

  threads: () => [...staffKeys.all, 'threads'] as const,
  thread: (id: number) => [...staffKeys.all, 'thread', id] as const,
  announcements: () => [...staffKeys.all, 'announcements'] as const,
  events: () => [...staffKeys.all, 'events'] as const,

  leaveTypes: () => [...staffKeys.all, 'leave-types'] as const,
  leaveRequests: (params: Params) => [...staffKeys.all, 'leave-requests', params] as const,

  inbox: (page: number) => [...staffKeys.all, 'inbox', page] as const,
  inboxAll: () => [...staffKeys.all, 'inbox'] as const,
  approvalsCount: () => [...staffKeys.all, 'approvals-count'] as const,
};
