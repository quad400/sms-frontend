import type { ComponentType } from 'react';

export type ShellNavItem = {
  href: string;
  label: string;
  tabLabel?: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
  anyPermission?: string[];
  tab?: boolean;
  moduleFlag?: string;
};

export type ShellNavGroup = {
  label: string;
  items: ShellNavItem[];
};

export function flattenShellNav(groups: ShellNavGroup[]): ShellNavItem[] {
  return groups.flatMap((group) => group.items);
}

export function filterShellNavItems(
  items: ShellNavItem[],
  can: (permission: string) => boolean,
  isModuleEnabled: (flag: string) => boolean = () => true,
): ShellNavItem[] {
  return items.filter((item) => {
    if (item.permission && !can(item.permission)) return false;
    if (item.anyPermission && !item.anyPermission.some((p) => can(p))) return false;
    if (item.moduleFlag && !isModuleEnabled(item.moduleFlag)) return false;
    return true;
  });
}

export function filterShellNavGroups(
  groups: ShellNavGroup[],
  can: (permission: string) => boolean,
  isModuleEnabled: (flag: string) => boolean = () => true,
): ShellNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterShellNavItems(group.items, can, isModuleEnabled),
    }))
    .filter((group) => group.items.length > 0);
}

/** Exact match for homeHref; prefix match for nested routes. */
export function isActiveShellPath(pathname: string, href: string, homeHref: string): boolean {
  if (pathname === href || pathname === `${href}/`) return true;
  if (href === homeHref) return false;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function formatTimezoneChip(timezone: string): string {
  const trimmed = timezone.trim();
  if (!trimmed) return 'UTC';

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: trimmed,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    const abbrev = parts.find((part) => part.type === 'timeZoneName')?.value ?? trimmed;
    const city = trimmed.includes('/') ? trimmed.split('/').pop()?.replaceAll('_', ' ') : null;
    return city ? `${abbrev} (${city})` : abbrev;
  } catch {
    return trimmed;
  }
}

export function formatAcademicPeriodLabel(period: {
  sessionName?: string | null;
  termName?: string | null;
} | null | undefined): string | null {
  if (!period) return null;
  const session = period.sessionName?.trim();
  const term = period.termName?.trim();
  if (session && term) return `${session} ${term}`;
  return session || term || null;
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}
