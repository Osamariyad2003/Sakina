import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { AppError } from '../../../../core/errors';
import { config } from '../../../../config';
import { defaultHydrationGoalMl, type HydrationLog } from '../models/hydrationContent';

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

function fakeDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  await fakeDelay(100);
  return storage.getJSON<number>(storageKeys.hydrationGoalMl) ?? defaultHydrationGoalMl;
}

async function setGoal(ml: number): Promise<number> {
  await fakeDelay(150);
  storage.setJSON(storageKeys.hydrationGoalMl, ml);
  return ml;
}

async function getToday(): Promise<HydrationToday> {
  await fakeDelay();
  const goalMl = storage.getJSON<number>(storageKeys.hydrationGoalMl) ?? defaultHydrationGoalMl;
  const todayLogs = readLogs().filter((l) => isToday(l.createdAt));
  const totalMl = todayLogs.reduce((sum, l) => sum + l.sizeMl, 0);
  return { totalMl, goalMl, todayLogs };
}

async function logDrink(sizeMl: number): Promise<HydrationLog> {
  await fakeDelay(150);
  const log: HydrationLog = { id: `hydration-${Date.now()}`, sizeMl, createdAt: new Date().toISOString() };
  writeLogs([log, ...readLogs()]);
  return log;
}

async function listHistory(): Promise<HydrationLog[]> {
  await fakeDelay();
  return [...readLogs()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

if (!config.useMockServices) {
  throw new AppError('hydrationService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const hydrationService = { getToday, getGoal, setGoal, logDrink, listHistory };
