export const accountKeys = {
  all: ['account'] as const,
  prefs: () => [...accountKeys.all, 'prefs'] as const,
  sessions: () => [...accountKeys.all, 'sessions'] as const,
};
