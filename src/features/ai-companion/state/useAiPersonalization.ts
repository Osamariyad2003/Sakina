import { create } from 'zustand';
import { storage, storageKeys } from '../../../core/storage/mmkv';

interface AiPersonalizationState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Opt-in for "personalised replies": when on, the companion request carries
 * `personalize: true` and the backend may use a short summary of the user's own
 * recent mood, sleep, stress, hydration and goals (never journal text) when
 * replying. Off by default and kept separate from the onboarding consent,
 * whose copy promises the data isn't shared — sending summaries to an AI
 * provider needs its own explicit yes. It's a preference, not content, so
 * "Clear my data" leaves it alone.
 */
export const useAiPersonalization = create<AiPersonalizationState>((set) => ({
  enabled: storage.getBoolean(storageKeys.aiPersonalization) ?? false,
  setEnabled: (enabled) => {
    storage.set(storageKeys.aiPersonalization, enabled);
    set({ enabled });
  },
}));

/** Non-reactive read for services (which can't use hooks). */
export function isAiPersonalizationEnabled(): boolean {
  return useAiPersonalization.getState().enabled;
}
