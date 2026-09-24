import { storage, storageKeys } from '../../../core/storage/mmkv';
import { simulateLatency } from '../../../core/async/simulateLatency';
import type { MoodEntry } from '../../../types/models';
import type { CreateMoodEntryInput, MoodRepository } from './moodRepository';

/**
 * `MoodRepository` backed by on-device MMKV.
 *
 * [ASSUMPTION] Kept from the pre-backend days (product-definition.md Open
 * Question #4) so the app is usable with `EXPO_PUBLIC_LIVE_API` off. It is no
 * longer selected by a module-load branch inside the service — it is one
 * implementation of the interface, chosen in `moodService.ts`.
 *
 * The artificial delay stays: it keeps loading states honest during
 * development instead of everything resolving in the same tick.
 */


function readEntries(): MoodEntry[] {
  return storage.getJSON<MoodEntry[]>(storageKeys.mockMoodEntries) ?? [];
}

function writeEntries(entries: MoodEntry[]) {
  storage.setJSON(storageKeys.mockMoodEntries, entries);
}


export const localMoodRepository: MoodRepository = {
  async list(from?: Date) {
    await simulateLatency();
    const entries = [...readEntries()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (!from) return entries;
    return entries.filter((entry) => new Date(entry.createdAt).getTime() >= from.getTime());
  },

  async findById(id: string) {
    await simulateLatency(120);
    return readEntries().find((entry) => entry.id === id) ?? null;
  },

  async create(input: CreateMoodEntryInput) {
    await simulateLatency();
    const entry: MoodEntry = {
      id: `mood-${Date.now()}`,
      mood: input.mood,
      emotionIds: input.emotionIds,
      triggerIds: input.triggerIds,
      note: input.note,
      companionIds: input.companionIds ?? [],
      locationLabel: input.locationLabel,
      metrics: input.metrics,
      createdAt: new Date().toISOString(),
    };
    writeEntries([entry, ...readEntries()]);
    return entry;
  },

  async delete(id: string) {
    await simulateLatency(150);
    writeEntries(readEntries().filter((entry) => entry.id !== id));
  },
};
