import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { parseContract } from '../../../../core/api';
import { simulateLatency } from '../../../../core/async/simulateLatency';
import { apiClient, fetchAllPages, unwrap, type ApiSuccess } from '../../../../core/api';
import { config } from '../../../../config';
import { defaultHydrationGoalMl, type HydrationLog, HydrationLogSchema } from '../models/hydrationContent';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4) — same mock pattern as journal/mood/stress: MMKV persistence,
 * `fakeDelay` to exercise real loading states, and a loud failure if
 * `config.useMockServices` is ever flipped without a real implementation
 * wired up.
 */

function readLogs(): HydrationLog[] {
  return storage.getJSON<HydrationLog[]>(storageKeys.mockHydrationLogs) ?? [];
}

function writeLogs(logs: HydrationLog[]) {
  storage.setJSON(storageKeys.mockHydrationLogs, logs);
}


function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export interface HydrationToday {
  totalMl: number;
  goalMl: number;
  todayLogs: HydrationLog[];
}

async function getGoal(): Promise<number> {
  await simulateLatency(100);
  return storage.getJSON<number>(storageKeys.hydrationGoalMl) ?? defaultHydrationGoalMl;
}

async function setGoal(ml: number): Promise<number> {
  await simulateLatency(150);
  storage.setJSON(storageKeys.hydrationGoalMl, ml);
  return ml;
}

async function getToday(): Promise<HydrationToday> {
  await simulateLatency();
  const goalMl = storage.getJSON<number>(storageKeys.hydrationGoalMl) ?? defaultHydrationGoalMl;
  const todayLogs = readLogs().filter((l) => isToday(l.createdAt));
  const totalMl = todayLogs.reduce((sum, l) => sum + l.sizeMl, 0);
  return { totalMl, goalMl, todayLogs };
}

async function logDrink(sizeMl: number): Promise<HydrationLog> {
  await simulateLatency(150);
  const log: HydrationLog = { id: `hydration-${Date.now()}`, sizeMl, createdAt: new Date().toISOString() };
  writeLogs([log, ...readLogs()]);
  return log;
}

async function listHistory(): Promise<HydrationLog[]> {
  await simulateLatency();
  return [...readLogs()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// --- Real backend (config.useMockServices false) ----------------------------
// /hydration: POST { amountMl, loggedAt? } · GET (paginated, newest first) ·
// DELETE /:id. `sizeMl` ⇄ `amountMl`, `createdAt` ⇄ `loggedAt`. The daily goal
// has no backend field, so it stays a local preference (getGoal/setGoal).

interface ApiHydrationLog {
  id: string;
  amountMl: number;
  loggedAt: string;
}

function fromApiLog(log: ApiHydrationLog): HydrationLog {
  return parseContract(
    HydrationLogSchema,
    { id: log.id, sizeMl: log.amountMl, createdAt: log.loggedAt },
    'GET /hydration',
  );
}

async function liveGetToday(): Promise<HydrationToday> {
  const goalMl = storage.getJSON<number>(storageKeys.hydrationGoalMl) ?? defaultHydrationGoalMl;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  // Newest first, so one page of 100 covers any realistic day.
  const { data } = await apiClient.get<ApiSuccess<ApiHydrationLog[]>>('/hydration', { params: { limit: 100 } });
  const todayLogs = data.data.map(fromApiLog).filter((l) => new Date(l.createdAt) >= startOfToday);
  const totalMl = todayLogs.reduce((sum, l) => sum + l.sizeMl, 0);
  return { totalMl, goalMl, todayLogs };
}

async function liveLogDrink(sizeMl: number): Promise<HydrationLog> {
  return fromApiLog(unwrap(await apiClient.post<ApiSuccess<ApiHydrationLog>>('/hydration', { amountMl: sizeMl })));
}

async function liveListHistory(): Promise<HydrationLog[]> {
  return (await fetchAllPages<ApiHydrationLog>('/hydration')).map(fromApiLog);
}

export const hydrationService = config.useMockServices
  ? { getToday, getGoal, setGoal, logDrink, listHistory }
  : { getToday: liveGetToday, getGoal, setGoal, logDrink: liveLogDrink, listHistory: liveListHistory };
