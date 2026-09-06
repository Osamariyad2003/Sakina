import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SleepScheduleDraft } from '../features/wellness/sleep/models/sleepContent';
import type { MoodLevel } from '../types/models';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Language: undefined;
  Introduction: undefined;
  Goals: undefined;
  Baseline: undefined;
  Consent: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  /** Global search across the user's own content + the app's catalogues. */
  Search: { initialQuery?: string } | undefined;
  // Notifications & reminders (features/notifications).
  Notifications: undefined;
  ReminderSettings: undefined;
  // Therapist booking & appointments (features/professional-help).
  TherapistDirectory: undefined;
  TherapistDetail: { professionalId: string };
  /** Passing `rescheduleAppointmentId` turns the flow into a reschedule instead of a new booking. */
  BookAppointment: { professionalId: string; rescheduleAppointmentId?: string };
  AppointmentConfirmed: { appointmentId: string };
  Appointments: undefined;
  AppointmentDetail: { appointmentId: string };
  // Community support (features/community).
  Community: undefined;
  CommunityGroup: { groupId: string };
  CommunityThread: { threadId: string };
  NewCommunityThread: { groupId: string };
  /** Utility route for content that no longer resolves (features/errors). */
  NotFound: { entity?: string } | undefined;
};
export type CompanionStackParamList = {
  Conversation: undefined;
  // AI Mental Illness Symptom Checker sub-feature (features/symptom-checker).
  SymptomCheckerIntro: undefined;
  SymptomCheckMethod: undefined;
  SymptomSelect: undefined;
  SymptomAdditionalInfo: undefined;
  SymptomAnalyzing: undefined;
  SymptomResults: { sessionId?: string } | undefined;
  ConditionDetail: { conditionId: string };
  CheckerChatbot: undefined;
  CheckerSessionComplete: undefined;
  CheckerSessionHistory: undefined;
  // AI Therapy Chatbot sub-feature (features/ai-therapy).
  TherapyIntro: undefined;
  TherapyDashboard: undefined;
  TherapyChats: undefined;
  NewTherapyConversation: undefined;
  TherapyConversation: { conversationId: string };
  TherapyCustomInstructions: { conversationId?: string } | undefined;
};
export type MoodStackParamList = {
  MoodHome: undefined;
  /** `initialMood` lets Home's inline emoji row carry the user's first tap into the flow. */
  MoodCheckIn: { initialMood?: MoodLevel } | undefined;
  MoodHistory: undefined;
  MoodDetail: { entryId: string };
  MoodFilter: undefined;
  MoodOverview: undefined;
  MoodInsights: undefined;
  MoodSuggestionDetail: { suggestionId: string };
  MoodShare: undefined;
};
export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { entryId?: string } | undefined;
};
export type WellnessStackParamList = {
  WellnessHome: undefined;
  ExerciseDetails: { exerciseId: string };
  ActiveExercise: { exerciseId: string };
  // Stress Management sub-feature (features/wellness/stress-management).
  // StressActiveSession/StressCompletion route *types* are declared now so
  // the Technique Detail screen's "Start" button is fully wired — their
  // <Stack.Screen> registrations + screen components land in checkpoint 2.
  StressOverview: undefined;
  StressTechniqueDetail: { techniqueId: string };
  StressActiveSession: { techniqueId: string };
  StressCompletion: { techniqueId: string; sessionId?: string };
  // Hydration tracker (features/wellness/hydration).
  HydrationHome: undefined;
  HydrationLog: undefined;
  HydrationHistory: undefined;
  HydrationSettings: undefined;
  // Sleep Quality sub-feature (features/wellness/sleep).
  SleepQuality: undefined;
  SleepQualityChart: undefined;
  NewSleepSchedule: undefined;
  SleepGoal: undefined;
  SleepScheduleSetup: { goalMinutes?: number; bedtime?: string; wakeTime?: string } | undefined;
  SleepScheduleConfirm: { draft: SleepScheduleDraft };
  SleepScheduleCreated: { scheduleId?: string } | undefined;
  SleepAIAutosuggest: undefined;
  MySleepSchedule: undefined;
  SleepSession: { scheduleId?: string } | undefined;
  SleepSummary: { recordId?: string } | undefined;
  SleepHistory: undefined;
  SleepDetail: { recordId: string };
  SleepSuggestionDetail: { suggestionId: string };
  // Wellness resources & workshops (features/wellness/resources).
  WellnessResources: undefined;
  ResourceDetail: { resourceId: string };
  WorkshopDetail: { workshopId: string };
};
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Safety: undefined;
  // Help centre (features/profile/help).
  HelpCenter: undefined;
  HelpArticle: { articleId: string };
  ContactSupport: undefined;
  // Badges & achievements (features/badges).
  Badges: undefined;
  BadgeDetail: { badgeId: string };
};

export type AppTabsParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  CompanionTab: NavigatorScreenParams<CompanionStackParamList> | undefined;
  MoodTab: NavigatorScreenParams<MoodStackParamList> | undefined;
  JournalTab: NavigatorScreenParams<JournalStackParamList> | undefined;
  WellnessTab: NavigatorScreenParams<WellnessStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  App: undefined;
};
