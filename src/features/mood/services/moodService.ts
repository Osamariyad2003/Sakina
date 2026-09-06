import { storage, storageKeys } from '../../../core/storage/mmkv';
import { config } from '../../../config';
import { AppError } from '../../../core/errors';
import type { MoodEntry, MoodMetrics } from '../../../types/models';
import { moodLevelWeight } from '../models/moodContent';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4) — persists to MMKV so check-ins survive app restarts during
 * development. Swap for real `apiClient` calls once a backend exists; the
 * exported function signatures are the contract the rest of the app
 * depends on.
 */

function readEntries(): MoodEntry[] {
  return storage.getJSON<MoodEntry[]>(storageKeys.mockMoodEntries) ?? [];
}

function writeEntries(entries: MoodEntry[]) {
  storage.setJSON(storageKeys.mockMoodEntries, entries);
}

function fakeDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSameDay(isoA: string, isoB: string) {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

export interface CreateMoodEntryInput {
  mood: MoodEntry['mood'];
  emotionIds: string[];
  triggerIds: string[];
  note?: string;
  companionIds?: string[];
  locationLabel?: string;
  metrics?: MoodMetrics;
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  averageWeight: number | null; // null = no entries that day
}

async function listEntries(): Promise<MoodEntry[]> {
  await fakeDelay();
  return [...readEntries()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function getTodayEntry(): Promise<MoodEntry | null> {
  await fakeDelay(150);
  const nowIso = new Date().toISOString();
  const entries = readEntries();
  return entries.find((e) => isSameDay(e.createdAt, nowIso)) ?? null;
}

async function createEntry(input: CreateMoodEntryInput): Promise<MoodEntry> {
  await fakeDelay();
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
}

async function getEntry(id: string): Promise<MoodEntry | null> {
  await fakeDelay(120);
  return readEntries().find((e) => e.id === id) ?? null;
}

async function deleteEntry(id: string): Promise<void> {
  await fakeDelay(150);
  writeEntries(readEntries().filter((e) => e.id !== id));
}

/** Last N days' average mood weight, oldest first — used by MoodChart (RTL-aware rendering happens in the component). */
async function getTrend(days: number): Promise<TrendPoint[]> {
  await fakeDelay(200);
  const entries = readEntries();
  const points: TrendPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter((e) => e.createdAt.slice(0, 10) === key);
    const averageWeight = dayEntries.length
      ? dayEntries.reduce((sum, e) => sum + moodLevelWeight[e.mood], 0) / dayEntries.length
      : null;
    points.push({ date: key, averageWeight });
  }

  return points;
}

// Same pattern as authService: a loud failure if the mock flag is flipped
// without a real implementation wired up yet, rather than a silent no-op.
if (!config.useMockServices) {
  throw new AppError('moodService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const moodService = {
  listEntries,
  getTodayEntry,
  getEntry,
  createEntry,
  deleteEntry,
  getTrend,
};
