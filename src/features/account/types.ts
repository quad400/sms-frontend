import type { components, paths } from '@/lib/api/schema';

type JsonOf<Op> = Op extends { responses: { 200: { content: { 'application/json': infer D } } } }
  ? D
  : Op extends { responses: { 201: { content: { 'application/json': infer D } } } }
    ? D
    : unknown;

export type ChangePasswordBody = components['schemas']['ChangePasswordDto'];
export type NotificationPreferenceItem = components['schemas']['NotificationPreferenceItemDto'];
export type NotificationPreferences = JsonOf<
  paths['/api/v1/notification-preferences/me']['get']
>;
export type AuthSessions = JsonOf<paths['/api/v1/auth/sessions']['get']>;
