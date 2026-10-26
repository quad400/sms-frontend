export { StudentAccount } from './components/student-account';
export { StudentWelcome, isStudentWelcomeDone } from './components/student-welcome';

export { useChangePassword } from './hooks/use-change-password';
export { useNotificationPreferences } from './hooks/use-notification-preferences';
export { useRevokeSession } from './hooks/use-revoke-session';
export { useSessions } from './hooks/use-sessions';

export { changePasswordSchema, type ChangePasswordValues } from './schemas';
export type {
  AuthSessions,
  ChangePasswordBody,
  NotificationPreferenceItem,
  NotificationPreferences,
} from './types';
export { useUpdateNotificationPreferences } from './hooks/use-update-notification-preferences';
