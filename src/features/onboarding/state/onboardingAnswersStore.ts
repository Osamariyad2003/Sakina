import { create } from 'zustand';
import { storage, storageKeys } from '../../../core/storage/mmkv';

export interface OnboardingAnswers {
  goalIds: string[];
  baseline: Record<string, string>;
  /** Answers to `kind: 'multi'` baseline questions (e.g. `focusTopics`). */
  multiAnswers: Record<string, string[]>;
  /** Answers to `kind: 'scale'` baseline questions (e.g. `stressLevelScale`, 1-5). */
  scaleAnswers: Record<string, number>;
}

interface OnboardingAnswersState extends OnboardingAnswers {
  toggleGoal: (goalId: string) => void;
  setBaselineAnswer: (questionId: string, optionId: string) => void;
  toggleMultiAnswer: (questionId: string, optionId: string) => void;
  setScaleAnswer: (questionId: string, value: number) => void;
}

const stored = storage.getJSON<Partial<OnboardingAnswers>>(storageKeys.onboardingAnswers);
// `multiAnswers`/`scaleAnswers` are newer than `goalIds`/`baseline` — default them for
// any answers persisted before this feature landed, rather than crashing on undefined.
const initial: OnboardingAnswers = {
  goalIds: stored?.goalIds ?? [],
  baseline: stored?.baseline ?? {},
  multiAnswers: stored?.multiAnswers ?? {},
  scaleAnswers: stored?.scaleAnswers ?? {},
};

function persist(answers: OnboardingAnswers) {
  storage.setJSON(storageKeys.onboardingAnswers, answers);
}

/**
 * [ASSUMPTION] These answers aren't consumed by any backend/Insights yet
 * (Insights is deferred from MVP — product-definition.md §13). Persisted
 * locally now so the data exists once that consumer is built.
 */
export const useOnboardingAnswersStore = create<OnboardingAnswersState>((set, get) => ({
  ...initial,

  toggleGoal: (goalId) => {
    const goalIds = get().goalIds.includes(goalId)
      ? get().goalIds.filter((id) => id !== goalId)
      : [...get().goalIds, goalId];
    const next = { ...get(), goalIds };
    persist(next);
    set({ goalIds });
  },

  setBaselineAnswer: (questionId, optionId) => {
    const baseline = { ...get().baseline, [questionId]: optionId };
    persist({ ...get(), baseline });
    set({ baseline });
  },

  toggleMultiAnswer: (questionId, optionId) => {
    const current = get().multiAnswers[questionId] ?? [];
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    const multiAnswers = { ...get().multiAnswers, [questionId]: next };
    persist({ ...get(), multiAnswers });
    set({ multiAnswers });
  },

  setScaleAnswer: (questionId, value) => {
    const scaleAnswers = { ...get().scaleAnswers, [questionId]: value };
    persist({ ...get(), scaleAnswers });
    set({ scaleAnswers });
  },
}));
