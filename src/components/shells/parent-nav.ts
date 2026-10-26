import {
  Banknote,
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Settings,
} from 'lucide-react';
import {
  isActiveShellPath,
  type ShellNavGroup,
  type ShellNavItem,
} from '@/components/shells/shell-nav';

export type ParentNavItem = ShellNavItem;
export type ParentNavGroup = ShellNavGroup;

/** Placeholder in hrefs replaced with the active student id. */
export const PARENT_CHILD_TOKEN = '$';

export {
  flattenShellNav as flattenParentNav,
  filterShellNavItems as filterParentNavItems,
  filterShellNavGroups as filterParentNavGroups,
} from '@/components/shells/shell-nav';

export function isActiveParentPath(pathname: string, href: string): boolean {
  return isActiveShellPath(pathname, href, '/parent');
}

export function childPath(studentId: number, suffix: string): string {
  return `/parent/children/${studentId}${suffix}`;
}

/** Swap `$` in nav hrefs for the active child id. */
export function resolveParentNavGroups(
  groups: ParentNavGroup[],
  studentId: number | null,
): ParentNavGroup[] {
  if (studentId === null) return groups;
  const token = String(studentId);
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      href: item.href.includes(`/${PARENT_CHILD_TOKEN}/`)
        ? item.href.replace(`/${PARENT_CHILD_TOKEN}/`, `/${token}/`)
        : item.href,
    })),
  }));
}

export const PARENT_NAV_GROUPS: ParentNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/parent',
        label: 'Home',
        tabLabel: 'Home',
        icon: LayoutDashboard,
        permission: 'portal.child.list',
        tab: true,
      },
    ],
  },
  {
    label: 'Academics',
    items: [
      {
        href: `/parent/children/${PARENT_CHILD_TOKEN}/results`,
        label: 'Results',
        tabLabel: 'Results',
        icon: GraduationCap,
        permission: 'portal.result.read',
        tab: true,
      },
      {
        href: `/parent/children/${PARENT_CHILD_TOKEN}/attendance`,
        label: 'Attendance',
        icon: ClipboardList,
        permission: 'portal.attendance.read',
      },
      {
        href: `/parent/children/${PARENT_CHILD_TOKEN}/timetable`,
        label: 'Timetable',
        icon: CalendarDays,
        permission: 'portal.timetable.read',
      },
      {
        href: `/parent/children/${PARENT_CHILD_TOKEN}/report-cards`,
        label: 'Report cards',
        icon: FileText,
        permission: 'portal.report-card.read',
      },
    ],
  },
  {
    label: 'Fees',
    items: [
      {
        href: `/parent/children/${PARENT_CHILD_TOKEN}/fees`,
        label: 'Fees',
        tabLabel: 'Fees',
        icon: Banknote,
        permission: 'portal.invoice.read',
        tab: true,
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        href: '/parent/messages',
        label: 'Messages',
        tabLabel: 'Messages',
        icon: MessagesSquare,
        permission: 'communication.message.list',
        tab: true,
      },
      {
        href: '/parent/announcements',
        label: 'Announcements',
        icon: Megaphone,
        permission: 'portal.announcement.read',
      },
      {
        href: '/parent/events',
        label: 'Events',
        icon: CalendarDays,
        permission: 'portal.event.read',
      },
      {
        href: '/parent/notifications',
        label: 'Notifications',
        icon: Bell,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        href: '/parent/account',
        label: 'Account & Settings',
        icon: Settings,
      },
    ],
  },
];

export const PARENT_MORE_EXTRA: ParentNavItem[] = [];
