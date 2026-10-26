import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Palmtree,
  Settings,
  Users,
} from 'lucide-react';
import {
  isActiveShellPath,
  type ShellNavGroup,
  type ShellNavItem,
} from '@/components/shells/shell-nav';

export type StaffNavItem = ShellNavItem;
export type StaffNavGroup = ShellNavGroup;

export {
  flattenShellNav as flattenStaffNav,
  filterShellNavItems as filterStaffNavItems,
  filterShellNavGroups as filterStaffNavGroups,
} from '@/components/shells/shell-nav';

export function isActiveStaffPath(pathname: string, href: string): boolean {
  return isActiveShellPath(pathname, href, '/staff');
}

export const STAFF_NAV_GROUPS: StaffNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/staff',
        label: 'Today',
        tabLabel: 'Today',
        icon: LayoutDashboard,
        tab: true,
      },
    ],
  },
  {
    label: 'Teaching',
    items: [
      {
        href: '/staff/attendance',
        label: 'Attendance',
        tabLabel: 'Attendance',
        icon: ClipboardList,
        permission: 'attendance.register.list',
        tab: true,
      },
      {
        href: '/staff/scores',
        label: 'Scores',
        tabLabel: 'Scores',
        icon: GraduationCap,
        permission: 'assessment.assessment.list',
        tab: true,
      },
      {
        href: '/staff/timetable',
        label: 'My timetable',
        icon: CalendarDays,
        permission: 'academics.timetable.list',
      },
      {
        href: '/staff/classes',
        label: 'My classes',
        icon: Users,
        permission: 'staff.allocation.list',
      },
      {
        href: '/staff/lessons',
        label: 'Lesson plans',
        icon: BookOpen,
        permission: 'academics.lesson-plan.list',
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        href: '/staff/messages',
        label: 'Messages',
        tabLabel: 'Messages',
        icon: MessagesSquare,
        permission: 'communication.message.list',
        tab: true,
      },
      {
        href: '/staff/announcements',
        label: 'Announcements',
        icon: Megaphone,
        permission: 'communication.announcement.list',
      },
      {
        href: '/staff/calendar',
        label: 'Calendar',
        icon: CalendarDays,
        permission: 'communication.event.list',
      },
      {
        href: '/staff/notifications',
        label: 'Notifications',
        icon: Bell,
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        href: '/staff/leave',
        label: 'Leave',
        icon: Palmtree,
        permission: 'staff.leave.create',
      },
      {
        href: '/staff/approvals',
        label: 'Approvals',
        icon: CheckSquare,
        anyPermission: [
          'assessment.result.approve',
          'academics.lesson-plan.approve',
          'staff.leave.decide',
        ],
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        href: '/staff/account',
        label: 'Account & Settings',
        icon: Settings,
      },
    ],
  },
];

export const STAFF_MORE_EXTRA: StaffNavItem[] = [];
