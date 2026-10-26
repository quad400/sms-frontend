export type ParentChild = {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  campusId: number;
  photoFileId: number | null;
  photoUrl?: string | null;
  classId: number | null;
  sessionId: number | null;
  className?: string | null;
  relationship?: string | null;
};

export type ParentChildOverview = {
  child: ParentChild;
  attendanceRecent: AttendanceEntry[];
  latestResults: ResultTerm[];
  resultsWithheld: boolean;
  balances: BalanceRow[];
  announcements: AnnouncementItem[];
  enrolment: { classId: number; className?: string | null } | null;
  academicPeriod: { sessionName?: string | null; termName?: string | null } | null;
};

export type AttendanceEntry = {
  date: string;
  status?: string;
  mark?: string;
  note?: string | null;
};

export type ResultSubject = {
  subjectId: number;
  subjectName?: string | null;
  score?: number | null;
  maxScore?: number | null;
  grade?: string | null;
  position?: number | null;
  remark?: string | null;
  classAverage?: number | null;
};

export type ResultTerm = {
  termId?: number;
  termName?: string | null;
  sessionName?: string | null;
  status?: string;
  withheld?: boolean;
  total?: number | null;
  average?: number | null;
  position?: number | null;
  subjects?: ResultSubject[];
};

export type ReportCard = {
  id: number;
  termId?: number;
  termName?: string | null;
  sessionName?: string | null;
  status?: string;
  withheld?: boolean;
  documentId?: number | null;
  signedUrl?: string | null;
  publishedAt?: string | null;
};

export type TimetableSlot = {
  id?: number;
  weekday: string;
  startTime?: string;
  endTime?: string;
  periodName?: string | null;
  subjectName?: string | null;
  teacherName?: string | null;
  roomName?: string | null;
  ordinal?: number;
};

export type BalanceRow = {
  currency: string;
  outstandingMinor: number;
};

export type InvoiceLine = {
  id?: number;
  description?: string;
  amountMinor?: number;
};

export type Invoice = {
  id: number;
  number?: string;
  reference?: string;
  status?: string;
  statusCode?: string;
  currency: string;
  totalMinor?: number;
  amountMinor?: number;
  amountPaidMinor?: number;
  dueDate?: string | null;
  lines?: InvoiceLine[];
};

export type ChildInvoicesResponse = {
  balances: BalanceRow[];
  invoices: Invoice[];
};

export type Receipt = {
  id: number;
  receiptNumber: string;
  paymentId: number;
  invoiceId: number;
  amountMinor: number;
  currency: string;
  issuedAt: string;
  documentId: number | null;
};

export type CheckoutSession = {
  id: number;
  gatewaySessionId: string;
  authorizationUrl: string;
  reference: string;
  amountMinor: number;
  currency: string;
};

export type AnnouncementItem = {
  id: number;
  title: string;
  body?: string | null;
  publishedAt?: string | null;
};

export type CalendarEvent = {
  id: number;
  eventType: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

export type PortalMe = {
  displayName?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  mustChangePassword?: boolean;
};

export type MessageThread = {
  id: number;
  subject: string;
  studentId?: number | null;
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

export type InboxNotification = {
  id: number;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  meta?: { studentId?: number; date?: string; type?: string } | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};
