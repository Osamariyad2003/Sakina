import { create } from 'zustand';
import type { CheckerMethod } from '../models/checkerContent';

/**
 * In-progress checker inputs, shared across the multi-step flow (same
 * zustand pattern as onboardingAnswersStore). Not persisted — a checker run
 * is transient; only the finished session is stored (checkerService).
 */
interface CheckerDraftState {
  method: CheckerMethod;
  symptomIds: string[];
  medicationIds: string[];
  botherSymptomId: string | null;
  conditionId: string | null;
  painLevel: number; // 1-5
  emotionId: string | null;
  moodDescription: string;
  reasonText: string;
  shareToChatbot: boolean;
  /** Chatbot free-text self-harm answer (risk-scanned). */
  selfHarmText: string;
  physicalSymptomIds: string[];

  setMethod: (m: CheckerMethod) => void;
  toggleSymptom: (id: string) => void;
  togglePhysicalSymptom: (id: string) => void;
  toggleMedication: (id: string) => void;
  set: (patch: Partial<CheckerDraftState>) => void;
  reset: () => void;
}

const initial = {
  method: 'manual' as CheckerMethod,
  symptomIds: [] as string[],
  medicationIds: [] as string[],
  botherSymptomId: null as string | null,
  conditionId: null as string | null,
  painLevel: 2,
  emotionId: null as string | null,
  moodDescription: '',
  reasonText: '',
  shareToChatbot: true,
  selfHarmText: '',
  physicalSymptomIds: [] as string[],
};

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export const useCheckerStore = create<CheckerDraftState>((set, get) => ({
  ...initial,
  setMethod: (method) => set({ method }),
  toggleSymptom: (id) => set({ symptomIds: toggle(get().symptomIds, id) }),
  togglePhysicalSymptom: (id) => set({ physicalSymptomIds: toggle(get().physicalSymptomIds, id) }),
  toggleMedication: (id) => set({ medicationIds: toggle(get().medicationIds, id) }),
  set: (patch) => set(patch),
  reset: () => set({ ...initial }),
}));
