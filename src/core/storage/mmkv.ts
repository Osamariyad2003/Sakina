import { createMMKV } from 'react-native-mmkv';

/**
 * Non-sensitive cache/draft storage (journal autosave, onboarding progress,
 * language preference, UI prefs). Tokens NEVER go here — see secureStore.ts.
 */
export const mmkv = createMMKV({ id: 'sakina.cache' });

export const storageKeys = {
  language: 'app.language',
  onboardingComplete: 'app.onboardingComplete',
  journalDraftPrefix: 'journal.draft.',
  /** [ASSUMPTION] Mock-backend-only user table — see features/authentication/services/authService.ts. */
  mockUsers: 'mock.auth.users',
  /** Non-sensitive profile cache so a restored session can show the user's name without a `/me` call. */
  currentUserProfile: 'auth.currentUserProfile',
  /** Onboarding Goals/Baseline answers — seeds early Insights personalization (spec §11/§145). */
  onboardingAnswers: 'onboarding.answers',
  /** [ASSUMPTION] Mock-backend-only mood entries — see features/mood/services/moodService.ts. */
  mockMoodEntries: 'mock.mood.entries',
  /** [ASSUMPTION] Mock-backend-only chat history — see features/ai-companion/services/companionService.ts. */
  mockChatMessages: 'mock.companion.messages',
  /** [ASSUMPTION] Mock-backend-only journal entries — see features/journal/services/journalService.ts. */
  mockJournalEntries: 'mock.journal.entries',
  /** [ASSUMPTION] Mock-backend-only stress-session records — see features/wellness/stress-management/services/stressService.ts. */
  mockStressSessions: 'mock.stress.sessions',
  /** [ASSUMPTION] Self-reported (never measured/inferred) daily stress-level entries — see features/home/services/homeService.ts. */
  selfReportedStressLevels: 'mock.home.stressLevels',
  /** [ASSUMPTION] Mock-backend-only hydration logs — see features/wellness/hydration/services/hydrationService.ts. */
  mockHydrationLogs: 'mock.hydration.logs',
  /** User-set daily hydration goal (ml) — not mock data, a real local preference. */
  hydrationGoalMl: 'hydration.goalMl',
  /** [ASSUMPTION] Mock-backend-only sleep records — see features/wellness/sleep/services/sleepService.ts. */
  mockSleepRecords: 'mock.sleep.records',
  /** User-created sleep schedules — a real local preference (bed/wake times, active days, alarm prefs). */
  sleepSchedules: 'sleep.schedules',
  /** [ASSUMPTION] Mock-backend-only symptom-checker sessions — see features/symptom-checker/services/checkerService.ts. */
  mockCheckerSessions: 'mock.checker.sessions',
  /** [ASSUMPTION] Mock-backend-only AI therapy conversations — see features/ai-therapy/services/therapyService.ts. */
  mockTherapyConversations: 'mock.therapy.conversations',
  /** Prefix for per-conversation therapy messages (`mock.therapy.messages.<conversationId>`). */
  therapyMessagesPrefix: 'mock.therapy.messages.',
  /** Recent global-search terms (a local convenience, not content). */
  recentSearches: 'search.recent',
  /** [ASSUMPTION] Mock-backend-only in-app notification inbox — see features/notifications/services/notificationService.ts. */
  mockNotifications: 'mock.notifications.inbox',
  /** User's reminder preferences (which reminders, at what time) — a real local preference. */
  reminderPreferences: 'notifications.reminderPreferences',
  /** [ASSUMPTION] Mock-backend-only therapist appointments — see features/professional-help/services/professionalService.ts. */
  mockAppointments: 'mock.professional.appointments',
  /** Article/workshop ids the user saved for later — a real local preference. */
  savedResources: 'resources.saved',
  /** Workshop ids the user registered for — [ASSUMPTION] mock-backend-only, no real registration API. */
  mockWorkshopRegistrations: 'mock.resources.workshopRegistrations',
  /** [ASSUMPTION] Mock-backend-only community posts the user wrote — see features/community/services/communityService.ts. */
  mockCommunityPosts: 'mock.community.posts',
  /** Community pseudonym + guidelines acceptance — a real local preference, never the real display name. */
  communityProfile: 'community.profile',
  /** Badge ids the user has already seen celebrated, so a badge only celebrates once. */
  badgesSeen: 'badges.seenIds',
} as const;

export const storage = {
  getString(key: string): string | undefined {
    return mmkv.getString(key);
  },
  set(key: string, value: string | boolean | number) {
    mmkv.set(key, value);
  },
  getBoolean(key: string): boolean | undefined {
    return mmkv.getBoolean(key);
  },
  delete(key: string) {
    mmkv.remove(key);
  },
  getJSON<T>(key: string): T | undefined {
    const raw = mmkv.getString(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
  setJSON<T>(key: string, value: T) {
    mmkv.set(key, JSON.stringify(value));
  },
};

/**
 * Wipes locally-stored emotional CONTENT (mood/journal/chat/onboarding
 * answers) — not the session, not the onboarding-complete flag, not the
 * language preference. Used by Profile → Privacy's "clear my data" action.
 * [ASSUMPTION] product-definition.md flags data export/delete as an open
 * item (§11, Open Question #5); this is a real local-only implementation
 * of delete, not yet a server-side one, since no backend exists.
 */
export function clearAllLocalContentData() {
  mmkv.remove(storageKeys.mockMoodEntries);
  mmkv.remove(storageKeys.mockChatMessages);
  mmkv.remove(storageKeys.mockJournalEntries);
  mmkv.remove(storageKeys.mockStressSessions);
  mmkv.remove(storageKeys.selfReportedStressLevels);
  mmkv.remove(storageKeys.mockHydrationLogs);
  mmkv.remove(storageKeys.mockSleepRecords);
  mmkv.remove(storageKeys.mockCheckerSessions);
  // Per-conversation therapy message blobs are keyed by id; clear each, then the index.
  const therapyConversations = storage.getJSON<{ id: string }[]>(storageKeys.mockTherapyConversations) ?? [];
  for (const conversation of therapyConversations) {
    mmkv.remove(`${storageKeys.therapyMessagesPrefix}${conversation.id}`);
  }
  mmkv.remove(storageKeys.mockTherapyConversations);
  mmkv.remove(storageKeys.onboardingAnswers);
  mmkv.remove(storageKeys.mockNotifications);
  mmkv.remove(storageKeys.mockAppointments);
  mmkv.remove(storageKeys.mockCommunityPosts);
  mmkv.remove(storageKeys.recentSearches);
}
