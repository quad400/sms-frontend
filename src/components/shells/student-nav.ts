import {
  Banknote,
  BookMarked,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Radio,
  Settings,
} from 'lucide-react';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';
import {
  isActiveShellPath,
  type ShellNavGroup,
  type ShellNavItem,
} from '@/components/shells/shell-nav';

export type StudentNavItem = ShellNavItem;
export type StudentNavGroup = ShellNavGroup;

export {
  flattenShellNav as flattenStudentNav,
  filterShellNavItems as filterStudentNavItems,
  filterShellNavGroups as filterStudentNavGroups,
  formatTimezoneChip,
  formatAcademicPeriodLabel,
} from '@/components/shells/shell-nav';

export function isActiveStudentPath(pathname: string, href: string): boolean {
  return isActiveShellPath(pathname, href, '/student');
}

/**
 * Desktop sidebar groups match the expanded Courierdock stitch IA.
 */
export const STUDENT_NAV_GROUPS: StudentNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/student',
        label: 'Dashboard',
        tabLabel: 'Home',
        icon: LayoutDashboard,
        permission: 'portal.profile.read',
        tab: true,
      },
    ],
  },
  {
    label: 'Academics',
    items: [
      {
        href: '/student/timetable',
        label: 'Daily Timetable',
        tabLabel: 'Timetable',
        icon: CalendarDays,
        permission: 'portal.timetable.read',
        tab: true,
      },
      {
        href: '/student/lessons',
        label: 'Live Classes',
        icon: Radio,
        permission: 'portal.lesson-note.read',
      },
      {
        href: '/student/results',
        label: 'Terminal Results',
        tabLabel: 'Results',
        icon: GraduationCap,
        permission: 'portal.result.read',
        tab: true,
      },
    ],
  },
  {
    label: 'Student Records',
    items: [
      {
        href: '/student/attendance',
        label: 'Attendance Matrix',
        icon: ClipboardList,
        permission: 'portal.attendance.read',
      },
      {
        href: '/student/library',
        label: 'Library Borrowing',
        icon: BookMarked,
        permission: 'portal.profile.read',
        moduleFlag: STUDENT_MODULE_FLAGS.library,
      },
      {
        href: '/student/medical',
        label: 'Medical & Clinic',
        icon: HeartPulse,
        permission: 'portal.profile.read',
        moduleFlag: STUDENT_MODULE_FLAGS.health,
      },
      {
        href: '/student/fees',
        label: 'School Ledger',
        icon: Banknote,
        permission: 'portal.invoice.read',
      },
    ],
  },
  {
    label: 'Community & Life',
    items: [
      {
        href: '/student/chatroom',
        label: 'Scholar Lounge',
        icon: MessagesSquare,
        permission: 'portal.profile.read',
        moduleFlag: STUDENT_MODULE_FLAGS.studentChat,
      },
      {
        href: '/student/announcements',
        label: 'Campus Dispatches',
        icon: Megaphone,
        permission: 'portal.announcement.read',
      },
      {
        href: '/student/events',
        label: 'School Events',
        icon: CalendarDays,
        permission: 'portal.event.read',
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        href: '/student/account',
        label: 'Account & Settings',
        icon: Settings,
        permission: 'portal.profile.read',
      },
    ],
  },
];

/** Secondary destinations kept in the mobile More sheet (not on the desktop rail). */
export const STUDENT_MORE_EXTRA: StudentNavItem[] = [
  {
    href: '/student/report-cards',
    label: 'Report cards',
    icon: GraduationCap,
    permission: 'portal.report-card.read',
  },
];
