import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { StressEntrySchema } from '../../../../types/models';
import { parseContract } from '../../../../core/api';
import { simulateLatency } from '../../../../core/async/simulateLatency';
import { config } from '../../../../config';
import { AppError } from '../../../../core/errors';
import { apiClient, fetchAllPages, fromApiTriggerKeys, toApiTriggerIds, unwrap, type ApiSuccess } from '../../../../core/api';
import type { StressEntry } from '../../../../types/models';
import { stressLevelWeight } from '../models/stressContent';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4) — same MMKV mock pattern as moodService. This is now the single
 * source of truth for "today's stress level": Home's quick-set widget and
 * the full Stress check-in screen both write through here, so the two
 * surfaces never disagree about what today's level is (see
 * `homeService.ts`, which delegates its `setStressLevel`/tracker-signal
 * logic to this module instead of keeping its own parallel store).
 */

function readEntries(): StressEntry[] {
  return storage.getJSON<StressEntry[]>(storageKeys.mockStressEntries) ?? [];
}

function writeEntries(entries: StressEntry[]) {
  storage.setJSON(storageKeys.mockStressEntries, entries);
}


function isSameDay(isoA: string, isoB: string) {
  return isoA.slice(0, 10) === isoB.slice(0, 10);
}

export interface CreateStressEntryInput {
  level: StressEntry['level'];
  triggerIds?: string[];
  note?: string;
}

export interface StressTrendPoint {
  date: string; // YYYY-MM-DD
  averageWeight: number | null; // null = no entries that day
}

async function listEntries(): Promise<StressEntry[]> {
  await simulateLatency();
  return [...readEntries()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function getTodayEntry(): Promise<StressEntry | null> {
  await simulateLatency(150);
  const nowIso = new Date().toISOString();
  return readEntries().find((e) => isSameDay(e.createdAt, nowIso)) ?? null;
}

async function createEntry(input: CreateStressEntryInput): Promise<StressEntry> {
  await simulateLatency();
  const entry: StressEntry = {
    id: `stress-entry-${Date.now()}`,
    level: input.level,
    triggerIds: input.triggerIds ?? [],
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  writeEntries([entry, ...readEntries()]);
  return entry;
}

async function getEntry(id: string): Promise<StressEntry | null> {
  await simulateLatency(120);
  return readEntries().find((e) => e.id === id) ?? null;
}

async function deleteEntry(id: string): Promise<void> {
  await simulateLatency(150);
  writeEntries(readEntries().filter((e) => e.id !== id));
}

/** Last N days' average stress weight, oldest first — mirrors moodService.getTrend, reused by MoodChart. */
async function getTrend(days: number): Promise<StressTrendPoint[]> {
  await simulateLatency(200);
  return buildTrend(readEntries(), days);
}

function buildTrend(entries: StressEntry[], days: number): StressTrendPoint[] {
  const points: StressTrendPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter((e) => e.createdAt.slice(0, 10) === key);
    const averageWeight = dayEntries.length
      ? dayEntries.reduce((sum, e) => sum + stressLevelWeight[e.level], 0) / dayEntries.length
      : null;
    points.push({ date: key, averageWeight });
  }

  return points;
}

// --- Real backend (config.useMockServices false) ----------------------------
// /stress: POST · GET (paginated, newest first) · GET|DELETE /:id. The level
// is self-reported and stored as-is; trigger ids go through the server
// catalogue (core/api/catalog.ts); `createdAt` ⇄ `occurredAt`.

interface ApiStressEntry {
  id: string;
  level: StressEntry['level'];
  note?: string | null;
  occurredAt: string;
  triggers: { trigger: { key: string } }[];
}

function fromApiEntry(entry: ApiStressEntry): StressEntry {
  const mapped = {
    id: entry.id,
    level: entry.level,
    triggerIds: fromApiTriggerKeys(entry.triggers.map((t) => t.trigger.key)),
    note: entry.note ?? undefined,
    createdAt: entry.occurredAt,
  };

  return parseContract(StressEntrySchema, mapped, 'GET /stress');
}

async function liveListEntries(): Promise<StressEntry[]> {
  return (await fetchAllPages<ApiStressEntry>('/stress')).map(fromApiEntry);
}

/** Newest 100 entries — plenty for "today" and the 7/30-day trends, without walking all history. */
async function liveRecentEntries(): Promise<StressEntry[]> {
  const { data } = await apiClient.get<ApiSuccess<ApiStressEntry[]>>('/stress', { params: { limit: 100 } });
  return data.data.map(fromApiEntry);
}

async function liveGetTodayEntry(): Promise<StressEntry | null> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [latest] = await liveRecentEntries();
  return latest && new Date(latest.createdAt) >= startOfToday ? latest : null;
}

async function liveCreateEntry(input: CreateStressEntryInput): Promise<StressEntry> {
  const body = {
    level: input.level,
    note: input.note || undefined,
    triggerIds: await toApiTriggerIds(input.triggerIds ?? []),
  };
  return fromApiEntry(unwrap(await apiClient.post<ApiSuccess<ApiStressEntry>>('/stress', body)));
}

async function liveGetEntry(id: string): Promise<StressEntry | null> {
  try {
    return fromApiEntry(unwrap(await apiClient.get<ApiSuccess<ApiStressEntry>>(`/stress/${id}`)));
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return null;
    throw error;
  }
}

async function liveDeleteEntry(id: string): Promise<void> {
  await apiClient.delete(`/stress/${id}`);
}

async function liveGetTrend(days: number): Promise<StressTrendPoint[]> {
  return buildTrend(await liveRecentEntries(), days);
}

const mockStressCheckInService = {
  listEntries,
  getTodayEntry,
  createEntry,
  getEntry,
  deleteEntry,
  getTrend,
};

const liveStressCheckInService: typeof mockStressCheckInService = {
  listEntries: liveListEntries,
  getTodayEntry: liveGetTodayEntry,
  createEntry: liveCreateEntry,
  getEntry: liveGetEntry,
  deleteEntry: liveDeleteEntry,
  getTrend: liveGetTrend,
};

export const stressCheckInService = config.useMockServices ? mockStressCheckInService : liveStressCheckInService;
