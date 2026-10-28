/**
 * Presentational placeholders for Access (users / RBAC) UI shell.
 */

export const ACCESS_UI_MOCK = {
  syncLabel: 'Active Directory & Security Sync: 4 mins ago',
  usersSummary: {
    total: 84,
    active: 78,
    suspended: 2,
    pending: 4,
    mfaRate: 94.0,
    mfaDelta: '+2.5% MoM',
    mfaNote: 'Enforced for Admin/Bursary',
    sessions: 42,
    web: 31,
    mobile: 11,
    failedLogins: 3,
    failedNote: 'Auto-locked 1 account.',
  },
  rolesSummary: {
    activeRoles: 8,
    permissionNodes: 142,
    elevated: 6,
    leastPrivilege: 98.4,
    leastDelta: '+1.2% compliant',
  },
  mfaBadges: [
    { kind: 'totp' as const, label: 'TOTP / Key', variant: 'successSoft' as const },
    { kind: 'sms' as const, label: 'SMS / Auth', variant: 'info' as const },
    { kind: 'pending' as const, label: 'Pending Setup', variant: 'warning' as const },
    { kind: 'app' as const, label: 'Authenticator', variant: 'soft' as const },
    { kind: 'off' as const, label: 'MFA Disabled', variant: 'dangerSoft' as const },
  ],
  inviteRoles: [
    {
      id: 'faculty',
      title: 'Academic Faculty & Form Tutor',
      description: 'Classroom delivery, attendance, and continuous assessment.',
      tags: ['C.A. Entry', 'Roll Attendance', 'Report Comments'],
      type: 'staff',
    },
    {
      id: 'bursary',
      title: 'Bursary & Finance Officer',
      description: 'Fee ledgers, invoicing, and settlement controls.',
      tags: ['Ledger Sync', 'Invoicing', 'Discounts'],
      type: 'admin',
    },
    {
      id: 'clinic',
      title: 'Clinic & Medical Personnel',
      description: 'Health records and pharmacy logging.',
      tags: ['HIPAA Protocols', 'Pharmacy Logs'],
      type: 'staff',
    },
    {
      id: 'registrar',
      title: 'Administrative Registrar & Admissions',
      description: 'Admissions pipeline and master register.',
      tags: ['Admissions', 'Master Register'],
      type: 'admin',
    },
  ],
  scopeCards: [
    { title: 'Full View / Edit', domain: 'Academics', tone: 'ok' as const },
    { title: 'Approve Authority', domain: 'Assessments', tone: 'ok' as const },
    { title: 'Read-Only', domain: 'Student Registry', tone: 'muted' as const },
    { title: 'Restricted', domain: 'Bursary Ledgers', tone: 'danger' as const },
  ],
} as const;

export function userExtraForId(id: number) {
  const mfa = ACCESS_UI_MOCK.mfaBadges[id % ACCESS_UI_MOCK.mfaBadges.length]!;
  const hours = 1 + (id % 48);
  const lastLogin =
    hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
  return {
    mfa,
    lastLogin,
    ip: `102.89.${(id * 3) % 255}.${(id * 7) % 255}`,
    location: id % 2 === 0 ? 'Lagos, NG' : 'Abuja, NG',
    title:
      id % 3 === 0
        ? 'Director of STEM Curriculum'
        : id % 3 === 1
          ? 'Senior Form Tutor'
          : 'Campus Administrator',
    staffCode: `STA-${String(id).padStart(3, '0')}`,
  };
}
