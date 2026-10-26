import type { components } from '@/lib/api/schema';

/**
 * Staff self-service responses are fully described by OpenAPI.
 * Product endpoints below return untyped bodies in `openapi.json`, so their shapes
 * mirror the backend mappers (`application/mappers` of each product module in `sms-backend`).
 */
export type StaffMe = components['schemas']['MyStaffResponseDto'];
export type StaffAllocation = components['schemas']['MyAllocationResponseDto'];
export type StaffOverview = components['schemas']['MyOverviewResponseDto'];
export type StaffOverviewPeriod = components['schemas']['MyOverviewTimetablePeriodResponseDto'];
export type StaffOverviewRegister = components['schemas']['MyOverviewOpenRegisterResponseDto'];
export type StaffOverviewAssessment = components['schemas']['MyOverviewAssessmentResponseDto'];
export type StaffOverviewLessonPlan = components['schemas']['MyOverviewLessonPlanResponseDto'];
export type StaffAnnouncement = components['schemas']['MyOverviewAnnouncementResponseDto'];

export type Paginated<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

// --- School structure ---

export type SchoolClass = {
  id: number;
  campusId: number;
  sessionId: number;
  levelId: number;
  armId: number;
  levelName: string;
  armName: string;
  name: string;
  formTeacherStaffId: number | null;
};

export type Subject = { id: number; code: string; name: string; isActive: boolean };

export type Term = {
  id: number;
  sessionId: number;
  period: string;
  periodName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  closedAt: string | null;
  holidays: Array<{ id: number; name: string; date: string }>;
};

export type TimeSlot = {
  id: number;
  name: string;
  ordinal: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
};

export type Room = { id: number; campusId: number; name: string; capacity: number | null };

export type StudentSummary = {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  status: string;
  photoFileId: number | null;
};

// --- Timetables ---

export type Timetable = {
  id: number;
  classId: number;
  sessionId: number;
  termId: number;
  status: string;
  publishedAt: string | null;
  slots?: TimetableSlot[];
};

export type TimetableSlot = {
  id: number;
  weekday: string;
  timeSlotId: number;
  timeSlotOrdinal: number;
  roomId: number | null;
  subjectId: number;
  teacherStaffId: number;
};

// --- Attendance ---

export const ATTENDANCE_MARKS = ['present', 'absent', 'late', 'excused'] as const;
export type AttendanceMark = (typeof ATTENDANCE_MARKS)[number];

export type AttendanceEntry = {
  id: string;
  registerId: number;
  studentId: number;
  mark: string;
  clientRef: string;
  note: string | null;
  markedAt: string;
};

export type AttendanceRegister = {
  id: number;
  classId: number;
  campusId: number;
  sessionId: number;
  termId: number;
  period: string;
  date: string;
  status: string;
  clientRef: string | null;
  submittedAt: string | null;
  createdAt: string;
  entries?: AttendanceEntry[];
};

export type MarkEntryInput = {
  clientRef: string;
  studentId: number;
  markCode: string;
  note?: string;
};

export type AttendanceSummary = {
  classId: number;
  registers: number;
  submittedRegisters: number;
  counts: Record<string, number>;
  total: number;
  attendanceRate: number | null;
};

// --- Assessments ---

export type Assessment = {
  id: number;
  componentId: number;
  componentName: string;
  maxScore: number;
  status: string;
  classId: number;
  subjectId: number;
  sessionId: number;
  termId: number;
  title: string;
  assessmentDate: string | null;
  submittedAt: string | null;
  createdAt: string;
};

export type Score = {
  id: number;
  assessmentId: number;
  studentId: number;
  clientRef: string | null;
  score: number | null;
  isAbsent: boolean;
  isLocked: boolean;
  updatedAt: string;
};

export type ScoreInput = {
  clientRef: string;
  studentId: number;
  score?: number;
  isAbsent?: boolean;
};

export type ResultSheet = {
  id: number;
  status: string;
  classId: number;
  sessionId: number;
  termId: number;
  gradingScaleId: number;
  schemeId: number;
  computedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

// --- Lessons ---

export type LessonPlan = {
  id: number;
  status: string;
  staffId: number;
  subjectId: number;
  classId: number;
  sessionId: number;
  termId: number;
  weekNumber: number | null;
  title: string;
  objectives: string | null;
  content: string;
  approvedBy: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LessonPlanDraft = {
  classId: number;
  subjectId: number;
  termId: number;
  weekNumber?: number;
  title: string;
  objectives?: string;
  content: string;
};

export type LessonPlanPatch = {
  title?: string;
  objectives?: string | null;
  content?: string;
  weekNumber?: number | null;
};

export type LessonNote = {
  id: number;
  staffId: number;
  subjectId: number;
  classId: number;
  sessionId: number;
  termId: number;
  title: string;
  body: string;
  attachments: Array<{ id: number; fileId: number }>;
  createdAt: string;
  updatedAt: string;
};

export type LessonNoteDraft = {
  classId: number;
  subjectId: number;
  termId: number;
  title: string;
  body: string;
};

export type LessonNotePatch = { title?: string; body?: string };

// --- Communication ---

export type MessageThread = {
  id: number;
  subject: string;
  studentId: number;
  participantUserIds: number[];
  createdAt: string;
};

export type ThreadMessage = {
  id: number;
  clientRef: string;
  senderUserId: number;
  body: string;
  sentAt: string;
};

export type MessageThreadDetail = MessageThread & { messages: ThreadMessage[] };

export type CalendarEvent = {
  id: number;
  eventType: string;
  campusId: number | null;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

export type AnnouncementRecord = StaffAnnouncement;

// --- Leave ---

export type LeaveType = {
  id: number;
  name: string;
  defaultDays: number;
  requiresApproval: boolean;
};

export type LeaveRequest = {
  id: number;
  staffId: number;
  staffName: string;
  campusId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  status: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  decidedBy: number | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
};

export type LeaveRequestDraft = {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
};

// --- Notifications ---

export type InboxNotification = {
  id: number;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};
