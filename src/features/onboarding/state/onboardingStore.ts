import { create } from 'zustand';
import { storage, storageKeys } from '../../../core/storage/mmkv';

interface OnboardingState {
  isComplete: boolean;
  markComplete: () => void;
}

/** Persisted in MMKV so returning users skip straight to the correct stack (spec §11). */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  isComplete: storage.getBoolean(storageKeys.onboardingComplete) ?? false,
  markComplete: () => {
    storage.set(storageKeys.onboardingComplete, true);
    set({ isComplete: true });
  },
}));
