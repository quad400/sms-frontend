export type Paginated<T> = {
  data: T[];
  meta: { page: number; pageSize: number; total: number };
};

export type StudentRow = {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string;
  genderCode?: string;
  status?: string;
  statusCode?: string;
  campusId?: number;
  classId?: number | null;
  className?: string | null;
  photoFileId?: number | null;
  primaryGuardianPhone?: string | null;
  balanceMinor?: number | null;
};

export type GuardianRow = {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  userId?: number | null;
  children?: Array<{ studentId: number; studentNumber?: string; name?: string }>;
};

export type StaffRow = {
  id: number;
  staffNumber?: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  genderCode?: string;
  jobTitleCode?: string;
  jobTitle?: string;
  campusId?: number;
  status?: string;
  statusCode?: string;
  userId?: number | null;
  email?: string | null;
  phone?: string | null;
  hireDate?: string | null;
};

export type LeaveRequest = {
  id: number;
  staffId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string | null;
  status: string;
  staffName?: string;
};

export type LeaveType = {
  id: number;
  name: string;
  code?: string;
  daysPerYear?: number;
  isActive?: boolean;
};

export type RoleRow = {
  id: number;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  userCount?: number;
  permissionCount?: number;
  permissionKeys?: string[];
};

export type PermissionRow = {
  key: string;
  module: string;
  moduleName?: string;
  resource: string;
  action: string;
  description?: string | null;
};

export type GroupedPermissionsResponse = {
  modules: Array<{
    key: string;
    name: string;
    permissions: Array<{
      key: string;
      resource: string;
      action: string;
      description: string | null;
    }>;
  }>;
};

export type UserRow = {
  id: number;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  type: string;
  status: string;
  lastLoginAt?: string | null;
  roleIds?: number[];
  roles?: Array<{ id: number; name: string }>;
  campusIds?: number[];
};

export type SchoolProfile = {
  name: string;
  timezone: string;
  defaultCurrencyCode: string;
  brandColour?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

export type DashboardSnapshot = {
  key: string;
  generatedAt?: string | null;
  payload?: Record<string, unknown> | null;
};

export function fullName(
  first?: string | null,
  last?: string | null,
  middle?: string | null,
): string {
  return [first, middle, last].filter(Boolean).join(' ').trim() || '—';
}
