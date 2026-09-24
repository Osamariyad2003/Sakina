import type { AIAction, AIActionType } from '../../../types/models';
import { config } from '../../../config';

/**
 * Where an AI-suggested action goes. The backend only ever names a type from
 * a fixed whitelist; this is the single place that maps a type onto screens
 * that already exist in the app — the actions reuse those flows, they don't
 * reimplement them. Pure (no React, no navigation object), so it is testable
 * and the screens stay free of routing rules.
 */
export type AIActionRoute =
  | { kind: 'companion'; screen: 'SymptomCheckerIntro' }
  | { kind: 'tab'; tab: 'WellnessTab' | 'JournalTab' | 'MoodTab' | 'HomeTab' | 'ProfileTab'; screen: string; params?: object };

// Exercise ids from features/wellness/models/wellnessContent.ts.
const BREATHING_EXERCISE_ID = 'breathing-478';
const GROUNDING_EXERCISE_ID = 'grounding-54321';

const routes: Record<AIActionType, AIActionRoute> = {
  breathing: { kind: 'tab', tab: 'WellnessTab', screen: 'ExerciseDetails', params: { exerciseId: BREATHING_EXERCISE_ID } },
  grounding: { kind: 'tab', tab: 'WellnessTab', screen: 'ExerciseDetails', params: { exerciseId: GROUNDING_EXERCISE_ID } },
  journal: { kind: 'tab', tab: 'JournalTab', screen: 'JournalEntry' },
  mood_checkin: { kind: 'tab', tab: 'MoodTab', screen: 'MoodCheckIn' },
  symptom_checker: { kind: 'companion', screen: 'SymptomCheckerIntro' },
  sleep: { kind: 'tab', tab: 'WellnessTab', screen: 'SleepQuality' },
  professionals: { kind: 'tab', tab: 'HomeTab', screen: 'TherapistDirectory' },
  safety: { kind: 'tab', tab: 'ProfileTab', screen: 'Safety' },
};

/** Returns null when the action can't be offered (e.g. booking is switched off), so the UI hides it. */
export function resolveActionRoute(action: AIAction): AIActionRoute | null {
  if (action.type === 'professionals' && !config.featureFlags.professionalBooking) return null;
  return routes[action.type] ?? null;
}

/** The actions worth rendering: only those that resolve to a real screen. */
export function visibleActions(actions: AIAction[] | undefined): AIAction[] {
  return (actions ?? []).filter((action) => resolveActionRoute(action) !== null);
}
