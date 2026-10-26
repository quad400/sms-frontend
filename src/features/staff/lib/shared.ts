/**
 * Single place where the staff feature reaches into other features.
 * The ESLint rule that forbids cross-feature imports is relaxed here on purpose:
 * `QueryState` (portal) and the account/security building blocks (account) are shared UI.
 */
/* eslint-disable no-restricted-imports */
export { QueryState } from '@/features/portal/components/query-state';
export { useChangePassword } from '@/features/account/hooks/use-change-password';
export { useRevokeSession } from '@/features/account/hooks/use-revoke-session';
export { useSessions } from '@/features/account/hooks/use-sessions';
export { changePasswordSchema, type ChangePasswordValues } from '@/features/account/schemas';
export { NotificationPreferencesPanel } from '@/features/account/components/notification-preferences-panel';
