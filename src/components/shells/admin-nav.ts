import {
  Banknote,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  School,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import {
  isActiveShellPath,
  type ShellNavGroup,
  type ShellNavItem,
} from '@/components/shells/shell-nav';

export type AdminNavItem = ShellNavItem;
export type AdminNavGroup = ShellNavGroup;

export {
  flattenShellNav as flattenAdminNav,
  filterShellNavItems as filterAdminNavItems,
  filterShellNavGroups as filterAdminNavGroups,
} from '@/components/shells/shell-nav';

export function isActiveAdminPath(pathname: string, href: string): boolean {
  return isActiveShellPath(pathname, href, '/admin');
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        tabLabel: 'Home',
        icon: LayoutDashboard,
        permission: 'reporting.dashboard.read',
        tab: true,
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        href: '/admin/students',
        label: 'Students',
        tabLabel: 'Students',
        icon: GraduationCap,
        permission: 'students.student.list',
        tab: true,
      },
      {
        href: '/admin/staff',
        label: 'Staff',
        icon: Users,
        permission: 'staff.staff.list',
      },
    ],
  },
  {
    label: 'Academics',
    items: [
      {
        href: '/admin/campuses',
        label: 'Structure',
        icon: Building2,
        anyPermission: [
          'school-structure.campus.list',
          'school-structure.session.list',
        ],
      },
      {
        href: '/admin/classes',
        label: 'Classes',
        icon: School,
        permission: 'school-structure.class.list',
      },
      {
        href: '/admin/subjects',
        label: 'Subjects',
        icon: BookOpen,
        permission: 'school-structure.subject.list',
      },
      {
        href: '/admin/houses',
        label: 'Houses',
        icon: Building2,
        permission: 'school-structure.house.list',
      },
      {
        href: '/admin/allocations',
        label: 'Allocations',
        icon: Users,
        permission: 'staff.allocation.list',
      },
      {
        href: '/admin/timetables',
        label: 'Timetables',
        icon: CalendarDays,
        permission: 'academics.timetable.list',
      },
      {
        href: '/admin/lesson-plans',
        label: 'Lesson plans',
        icon: ClipboardList,
        permission: 'academics.lesson-plan.list',
      },
      {
        href: '/admin/attendance',
        label: 'Attendance',
        icon: ClipboardList,
        permission: 'attendance.register.list',
      },
      {
        href: '/admin/attendance/reports',
        label: 'Attendance reports',
        icon: ClipboardList,
        permission: 'attendance.summary.read',
      },
      {
        href: '/admin/staff-attendance',
        label: 'Staff attendance',
        icon: Users,
        permission: 'attendance.staff.list',
      },
    ],
  },
  {
    label: 'Results',
    items: [
      {
        href: '/admin/grading-scales',
        label: 'Grading scales',
        icon: GraduationCap,
        permission: 'assessment.grading-scale.list',
      },
      {
        href: '/admin/schemes',
        label: 'Schemes',
        icon: BookOpen,
        permission: 'assessment.scheme.list',
      },
      {
        href: '/admin/workflows',
        label: 'Workflows',
        icon: ClipboardList,
        permission: 'assessment.workflow.read',
      },
      {
        href: '/admin/assessments',
        label: 'Assessments',
        icon: ClipboardList,
        permission: 'assessment.assessment.list',
      },
      {
        href: '/admin/result-sheets',
        label: 'Result sheets',
        icon: FileBarChart,
        permission: 'assessment.result-sheet.list',
      },
      {
        href: '/admin/report-cards',
        label: 'Report cards',
        icon: FileBarChart,
        permission: 'assessment.report-card.list',
      },
      {
        href: '/admin/report-templates',
        label: 'Templates',
        icon: BookOpen,
        permission: 'documents.template.list',
      },
    ],
  },
  {
    label: 'Fees',
    items: [
      {
        href: '/admin/fees/structures',
        label: 'Structures',
        icon: Banknote,
        permission: 'fees.structure.list',
      },
      {
        href: '/admin/fees/discounts',
        label: 'Discounts',
        icon: Banknote,
        permission: 'fees.discount.list',
      },
      {
        href: '/admin/fees/invoices',
        label: 'Invoices',
        icon: Banknote,
        permission: 'fees.invoice.list',
      },
      {
        href: '/admin/fees/payments',
        label: 'Payments',
        icon: Banknote,
        permission: 'fees.payment.list',
      },
      {
        href: '/admin/fees/reconciliation',
        label: 'Reconciliation',
        icon: Banknote,
        permission: 'fees.reconciliation.list',
      },
      {
        href: '/admin/fees/debtors',
        label: 'Debtors',
        icon: Banknote,
        permission: 'fees.debtor.list',
      },
      {
        href: '/admin/fees/clearance',
        label: 'Clearance',
        icon: Shield,
        permission: 'config.setting.read',
      },
    ],
  },
  {
    label: 'Admissions',
    items: [
      {
        href: '/admin/admissions/intakes',
        label: 'Intakes',
        icon: School,
        permission: 'admissions.intake.list',
      },
      {
        href: '/admin/admissions/applications',
        label: 'Applications',
        icon: ClipboardList,
        permission: 'admissions.application.list',
      },
      {
        href: '/admin/admissions/tests',
        label: 'Tests',
        icon: BookOpen,
        permission: 'admissions.test.list',
      },
      {
        href: '/admin/admissions/offers',
        label: 'Offers',
        icon: Megaphone,
        anyPermission: ['admissions.offer.issue', 'admissions.offer.withdraw', 'admissions.application.list'],
      },
      {
        href: '/admin/admissions/form',
        label: 'Form settings',
        icon: Settings,
        permission: 'admissions.application.list',
      },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        href: '/admin/announcements',
        label: 'Announcements',
        icon: Megaphone,
        permission: 'communication.announcement.list',
      },
      {
        href: '/admin/messages',
        label: 'Messages',
        icon: MessagesSquare,
        permission: 'communication.message.list',
      },
      {
        href: '/admin/events',
        label: 'Events',
        icon: CalendarDays,
        permission: 'communication.event.list',
      },
      {
        href: '/admin/reminders',
        label: 'Reminders',
        icon: Bell,
        permission: 'communication.reminder.list',
      },
      {
        href: '/admin/notification-templates',
        label: 'Templates',
        icon: Megaphone,
        permission: 'notifications.template.list',
      },
      {
        href: '/admin/deliveries',
        label: 'Deliveries',
        icon: Bell,
        permission: 'notifications.delivery.list',
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        href: '/admin/reports',
        label: 'Report catalogue',
        icon: FileBarChart,
        permission: 'reporting.report.list',
      },
    ],
  },
  {
    label: 'Access & Settings',
    items: [
      {
        href: '/admin/access/users',
        label: 'Users',
        icon: Users,
        permission: 'users.user.list',
      },
      {
        href: '/admin/access/roles',
        label: 'Roles',
        icon: Shield,
        permission: 'rbac.role.list',
      },
      {
        href: '/admin/access/audit',
        label: 'Audit',
        icon: ClipboardList,
        permission: 'audit.log.list',
      },
      {
        href: '/admin/settings/profile',
        label: 'School profile',
        icon: School,
        permission: 'config.profile.read',
      },
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings,
        permission: 'config.setting.read',
      },
      {
        href: '/admin/settings/modules',
        label: 'Modules',
        icon: Settings,
        permission: 'config.flag.read',
      },
      {
        href: '/admin/document-templates',
        label: 'Documents',
        icon: BookOpen,
        permission: 'documents.template.list',
      },
      {
        href: '/admin/data',
        label: 'Imports & exports',
        icon: ClipboardList,
        anyPermission: ['import-export.import.create', 'import-export.export.create'],
      },
      {
        href: '/admin/data-protection',
        label: 'Data protection',
        icon: Shield,
        anyPermission: ['students.erasure.create', 'students.consent.read'],
      },
      {
        href: '/admin/account',
        label: 'Account',
        icon: Settings,
      },
    ],
  },
];

export const ADMIN_MORE_EXTRA: AdminNavItem[] = [];
