import { create } from 'zustand';
import { storage, storageKeys } from '../../../core/storage/mmkv';

export interface OnboardingAnswers {
  goalIds: string[];
  baseline: Record<string, string>;
}

interface OnboardingAnswersState extends OnboardingAnswers {
  toggleGoal: (goalId: string) => void;
  setBaselineAnswer: (questionId: string, optionId: string) => void;
}

const initial = storage.getJSON<OnboardingAnswers>(storageKeys.onboardingAnswers) ?? {
  goalIds: [],
  baseline: {},
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
    persist({ goalIds: get().goalIds, baseline });
    set({ baseline });
  },
}));
