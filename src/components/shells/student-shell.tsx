'use client';

import type { ReactNode } from 'react';
import {
  Banknote,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Home,
  Megaphone,
  Settings,
  GraduationCap,
} from 'lucide-react';
import {
  ResponsivePortalShell,
  type PortalNavItem,
} from '@/components/shells/responsive-portal-shell';

const STUDENT_NAV: PortalNavItem[] = [
  { href: '/student', label: 'Home', icon: Home, permission: 'portal.profile.read', tab: true },
  {
    href: '/student/timetable',
    label: 'Timetable',
    icon: CalendarDays,
    permission: 'portal.timetable.read',
    tab: true,
  },
  {
    href: '/student/results',
    label: 'Results',
    icon: GraduationCap,
    permission: 'portal.result.read',
    tab: true,
  },
  {
    href: '/student/attendance',
    label: 'Attendance',
    icon: ClipboardList,
    permission: 'portal.attendance.read',
  },
  {
    href: '/student/report-cards',
    label: 'Report cards',
    icon: BookOpen,
    permission: 'portal.report-card.read',
  },
  {
    href: '/student/lessons',
    label: 'Lessons',
    icon: BookOpen,
    permission: 'portal.lesson-note.read',
  },
  {
    href: '/student/fees',
    label: 'Fees',
    icon: Banknote,
    permission: 'portal.invoice.read',
  },
  {
    href: '/student/announcements',
    label: 'Announcements',
    icon: Megaphone,
    permission: 'portal.announcement.read',
  },
  {
    href: '/student/events',
    label: 'Events',
    icon: CalendarDays,
    permission: 'portal.event.read',
  },
  {
    href: '/student/account',
    label: 'Account',
    icon: Settings,
    permission: 'portal.profile.read',
  },
];

export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <ResponsivePortalShell title="Student" items={STUDENT_NAV}>
      {children}
    </ResponsivePortalShell>
  );
}
