'use client';

import { useMemo, type ReactNode } from 'react';
import { RoleShell, type RoleShellChrome, type RoleShellConfig } from '@/components/shells/role-shell';
import { ShellSyncChip } from '@/components/shells/shell-sync-chip';
import { formatAcademicPeriodLabel } from '@/components/shells/shell-nav';
import {
  PARENT_MORE_EXTRA,
  PARENT_NAV_GROUPS,
  resolveParentNavGroups,
} from '@/components/shells/parent-nav';
import { STUDENT_MORE_EXTRA, STUDENT_NAV_GROUPS } from '@/components/shells/student-nav';
import { ADMIN_MORE_EXTRA, ADMIN_NAV_GROUPS } from '@/components/shells/admin-nav';
import { STAFF_MORE_EXTRA, STAFF_NAV_GROUPS } from '@/components/shells/staff-nav';
import { CampusSwitcher, DensityToggle } from '@/features/admin/components/campus-switcher';
import { AdminCampusProvider, useAdminCampus } from '@/features/admin/lib/campus';
import { ChildSwitcher } from '@/features/parent/components/child-switcher';
import { ActiveChildProvider, useActiveChild } from '@/features/parent/hooks/use-active-child';
import { useChildOverview } from '@/features/parent/hooks/use-child-data';
import { usePortalMe } from '@/features/portal/hooks/use-portal-me';
import { useFeatureFlags } from '@/lib/config/use-feature-flags';
import { useOfflineOutbox } from '@/lib/offline/use-offline-outbox';
import { asRecord, str } from '@/lib/utils/record';

export type AppShellRole = 'student' | 'staff' | 'parent' | 'admin';

export type AppShellChrome = {
  schoolName: string;
  timezone: string;
  notificationCount?: number;
};

const ROLE_CONFIG: Record<AppShellRole, RoleShellConfig> = {
  student: {
    homeHref: '/student',
    accountHref: '/student/account',
    portalLabel: 'Student Portal',
    storageKey: 'sms.student.sidebar.expanded',
    navGroups: STUDENT_NAV_GROUPS,
    moreExtra: STUDENT_MORE_EXTRA,
    maxTabs: 3,
    enableSearch: true,
    searchPlaceholder: 'Search subjects, teachers, schedule, notices...',
    title: 'Student',
  },
  staff: {
    homeHref: '/staff',
    accountHref: '/staff/account',
    portalLabel: 'Staff Portal',
    storageKey: 'sms.staff.sidebar.expanded',
    navGroups: STAFF_NAV_GROUPS,
    moreExtra: STAFF_MORE_EXTRA,
    maxTabs: 4,
    showUserMenu: true,
    enableSearch: false,
    notificationsHref: '/staff/notifications',
    title: 'Staff',
  },
  parent: {
    homeHref: '/parent',
    accountHref: '/parent/account',
    portalLabel: 'Parent Portal',
    storageKey: 'sms.parent.sidebar.expanded',
    navGroups: PARENT_NAV_GROUPS,
    moreExtra: PARENT_MORE_EXTRA,
    maxTabs: 4,
    showUserMenu: true,
    enableSearch: false,
    notificationsHref: '/parent/notifications',
    title: 'Parent',
  },
  admin: {
    homeHref: '/admin',
    accountHref: '/admin/account',
    portalLabel: 'Admin',
    storageKey: 'sms.admin.sidebar.expanded',
    contentWidth: 'admin',
    navGroups: ADMIN_NAV_GROUPS,
    moreExtra: ADMIN_MORE_EXTRA,
    maxTabs: 2,
    showUserMenu: true,
    enableSearch: true,
    searchPlaceholder: 'Find an admin page…',
    notificationsHref: '/admin/notifications',
    title: 'Admin',
  },
};

function StudentChromeExtras({
  chrome,
  children,
}: {
  chrome: AppShellChrome;
  children: (chrome: RoleShellChrome, isModuleEnabled: (flag: string) => boolean) => ReactNode;
}) {
  const flags = useFeatureFlags();
  const me = usePortalMe();
  const meRecord = asRecord(me.data);
  const academicFromMe = asRecord(meRecord?.academicPeriod);
  const academicPeriodLabel = formatAcademicPeriodLabel({
    sessionName: str(academicFromMe?.sessionName) || null,
    termName: str(academicFromMe?.termName) || null,
  });

  return (
    <>
      {children(
        {
          schoolName: chrome.schoolName,
          timezone: chrome.timezone,
          notificationCount: chrome.notificationCount,
          academicPeriodLabel,
        },
        flags.isEnabled,
      )}
    </>
  );
}

function StaffChromeExtras({
  chrome,
  children,
}: {
  chrome: AppShellChrome;
  children: (chrome: RoleShellChrome, leading: ReactNode) => ReactNode;
}) {
  const outbox = useOfflineOutbox();
  const leading = (
    <ShellSyncChip
      status={outbox.status}
      pendingCount={outbox.pendingCount}
      onSync={() => void outbox.flush()}
    />
  );

  return (
    <>
      {children(
        {
          schoolName: chrome.schoolName,
          timezone: chrome.timezone,
          notificationCount: chrome.notificationCount,
        },
        leading,
      )}
    </>
  );
}

function ParentChromeInner({
  chrome,
  config,
  children,
}: {
  chrome: AppShellChrome;
  config: RoleShellConfig;
  children: ReactNode;
}) {
  const { activeChildId } = useActiveChild();
  const overview = useChildOverview(activeChildId);
  const academic = overview.data?.academicPeriod;
  const navGroups = useMemo(
    () => resolveParentNavGroups(PARENT_NAV_GROUPS, activeChildId),
    [activeChildId],
  );
  const resolvedConfig = useMemo(
    () => ({ ...config, navGroups }),
    [config, navGroups],
  );

  return (
    <RoleShell
      chrome={{
        schoolName: chrome.schoolName,
        timezone: chrome.timezone,
        notificationCount: chrome.notificationCount,
        academicPeriodLabel: formatAcademicPeriodLabel({
          sessionName: academic?.sessionName ?? null,
          termName: academic?.termName ?? null,
        }),
      }}
      config={resolvedConfig}
      topBarLeading={<ChildSwitcher />}
    >
      {children}
    </RoleShell>
  );
}

function ParentChromeExtras({
  chrome,
  config,
  children,
}: {
  chrome: AppShellChrome;
  config: RoleShellConfig;
  children: ReactNode;
}) {
  return (
    <ActiveChildProvider>
      <ParentChromeInner chrome={chrome} config={config}>
        {children}
      </ParentChromeInner>
    </ActiveChildProvider>
  );
}

function AdminChromeInner({
  chrome,
  config,
  children,
}: {
  chrome: AppShellChrome;
  config: RoleShellConfig;
  children: ReactNode;
}) {
  const { density } = useAdminCampus();
  return (
    <div data-density={density} className="flex min-h-screen flex-1 flex-col">
      <RoleShell
        chrome={{
          schoolName: chrome.schoolName,
          timezone: chrome.timezone,
          notificationCount: chrome.notificationCount,
        }}
        config={config}
        topBarLeading={
          <div className="flex items-center gap-2">
            <CampusSwitcher />
            <DensityToggle />
          </div>
        }
      >
        {children}
      </RoleShell>
    </div>
  );
}

function AdminChromeExtras({
  chrome,
  config,
  children,
}: {
  chrome: AppShellChrome;
  config: RoleShellConfig;
  children: ReactNode;
}) {
  return (
    <AdminCampusProvider>
      <AdminChromeInner chrome={chrome} config={config}>
        {children}
      </AdminChromeInner>
    </AdminCampusProvider>
  );
}

/**
 * Single portal chrome for student, staff, parent, and admin. Pass `role` — nav, tabs, and
 * role-specific extras come from shared config.
 */
export function AppShell({
  role,
  chrome,
  children,
}: {
  role: AppShellRole;
  chrome: AppShellChrome;
  children: ReactNode;
}) {
  const config = useMemo(() => ROLE_CONFIG[role], [role]);

  if (role === 'student') {
    return (
      <StudentChromeExtras chrome={chrome}>
        {(resolvedChrome, isModuleEnabled) => (
          <RoleShell chrome={resolvedChrome} config={config} isModuleEnabled={isModuleEnabled}>
            {children}
          </RoleShell>
        )}
      </StudentChromeExtras>
    );
  }

  if (role === 'parent') {
    return (
      <ParentChromeExtras chrome={chrome} config={config}>
        {children}
      </ParentChromeExtras>
    );
  }

  if (role === 'admin') {
    return (
      <AdminChromeExtras chrome={chrome} config={config}>
        {children}
      </AdminChromeExtras>
    );
  }

  return (
    <StaffChromeExtras chrome={chrome}>
      {(resolvedChrome, leading) => (
        <RoleShell chrome={resolvedChrome} config={config} topBarLeading={leading}>
          {children}
        </RoleShell>
      )}
    </StaffChromeExtras>
  );
}
