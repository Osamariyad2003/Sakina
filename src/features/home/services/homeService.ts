import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { config } from '../../../config';
import { moodService } from '../../mood/services/moodService';
import { moodLevelWeight } from '../../mood/models/moodContent';
import { journalService } from '../../journal/services/journalService';
import { stressService } from '../../wellness/stress-management/services/stressService';
import { reflectionTemplates, type WellbeingReflection, type TrackerSignal, type StressLevel } from '../models/homeContent';
import type { MoodEntry } from '../../../types/models';

/**
 * Mostly derived/composed data, reading through the existing mock services
 * (mood/journal/stress — each already carries its own `config
 * .useMockServices` guard). The one exception is the self-reported Stress
 * Level tracker, which this module persists itself (never measured or
 * inferred — the user sets it), so this file gets its own guard too, same
 * pattern as journal/mood/companion/stress. `fakeDelay` matches the same
 * pattern so Home's cards exercise real loading states.
 */

function fakeDelay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface StressLevelEntry {
  level: StressLevel;
  createdAt: string;
}

function readStressLevels(): StressLevelEntry[] {
  return storage.getJSON<StressLevelEntry[]>(storageKeys.selfReportedStressLevels) ?? [];
}

function writeStressLevels(entries: StressLevelEntry[]) {
  storage.setJSON(storageKeys.selfReportedStressLevels, entries);
}

const stressLevelWeight: Record<StressLevel, number> = { low: 1, medium: 2, high: 3 };

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Last N day-keys (YYYY-MM-DD), oldest → newest, ending today. */
function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(dateKey(d));
  }
  return keys;
}

function withinLastDays(iso: string, days: number): boolean {
  const ageMs = Date.now() - new Date(iso).getTime();
  return ageMs >= 0 && ageMs <= days * 86400000;
}

async function getWellbeingReflection(): Promise<WellbeingReflection> {
  await fakeDelay();
  const [moodEntries, journalEntries, stressSessions] = await Promise.all([
    moodService.listEntries(),
    journalService.list(),
    stressService.listSessions(),
  ]);

  const last7 = moodEntries.filter((e) => withinLastDays(e.createdAt, 7));
  const prev7 = moodEntries.filter((e) => {
    const ageMs = Date.now() - new Date(e.createdAt).getTime();
    return ageMs > 7 * 86400000 && ageMs <= 14 * 86400000;
  });

  const average = (entries: MoodEntry[]) =>
    entries.length ? entries.reduce((sum, e) => sum + moodLevelWeight[e.mood], 0) / entries.length : null;

  const last7Avg = average(last7);
  const prev7Avg = average(prev7);

  let moodTrend: WellbeingReflection['moodTrend'];
  if (last7.length < 2) {
    moodTrend = 'notEnoughData';
  } else if (prev7Avg == null || Math.abs(last7Avg! - prev7Avg) < 0.4) {
    moodTrend = 'flat';
  } else {
    moodTrend = last7Avg! > prev7Avg ? 'up' : 'down';
  }

  const journalingDaysLast7 = new Set(
    journalEntries.filter((e) => withinLastDays(e.createdAt, 7)).map((e) => e.createdAt.slice(0, 10)),
  ).size;
  const stressSessionsLast7 = stressSessions.filter((s) => withinLastDays(s.completedAt ?? s.startedAt, 7)).length;

  const template = reflectionTemplates[moodTrend];
  return { summaryAr: template.ar, summaryEn: template.en, moodTrend, journalingDaysLast7, stressSessionsLast7 };
}

/** Consecutive days ending today present in `daySet`. */
function consecutiveStreak(daySet: Set<string>): number {
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (daySet.has(dateKey(d))) streak++;
    else break;
  }
  return streak;
}

async function getTrackerSignals(): Promise<TrackerSignal[]> {
  await fakeDelay();
  const [moodEntries, journalEntries, stressSessions, stressLevels] = await Promise.all([
    moodService.listEntries(),
    journalService.list(),
    stressService.listSessions(),
    Promise.resolve(readStressLevels()),
  ]);

  const days = lastNDayKeys(7);
  const moodDays = new Set(moodEntries.map((e) => e.createdAt.slice(0, 10)));
  const journalDays = new Set(journalEntries.map((e) => e.createdAt.slice(0, 10)));
  const minutesByDay: Record<string, number> = {};
  for (const s of stressSessions) {
    const key = (s.completedAt ?? s.startedAt).slice(0, 10);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + s.durationSeconds / 60;
  }
  const stressLevelByDay: Record<string, StressLevel> = {};
  for (const entry of stressLevels) {
    stressLevelByDay[entry.createdAt.slice(0, 10)] = entry.level;
  }

  const checkInsSparkline: number[] = days.map((d) => (moodDays.has(d) ? 1 : 0));
  const journalingSparkline: number[] = days.map((d) => (journalDays.has(d) ? 1 : 0));
  const wellnessSparkline = days.map((d) => Math.round(minutesByDay[d] ?? 0));
  const stressLevelSparkline = days.map((d) => (stressLevelByDay[d] ? stressLevelWeight[stressLevelByDay[d]] : 0));
  const todayLevel = stressLevelByDay[dateKey(new Date())] ?? null;

  return [
    { key: 'moodStreak', value: consecutiveStreak(moodDays), sparkline: checkInsSparkline },
    { key: 'checkIns', value: checkInsSparkline.reduce((a, b) => a + b, 0), sparkline: checkInsSparkline },
    { key: 'wellnessMinutes', value: wellnessSparkline.reduce((a, b) => a + b, 0), sparkline: wellnessSparkline },
    { key: 'journalingStreak', value: consecutiveStreak(journalDays), sparkline: journalingSparkline },
    { key: 'stressLevel', value: todayLevel ? stressLevelWeight[todayLevel] : 0, sparkline: stressLevelSparkline, level: todayLevel },
  ];
}

/** Sets *today's* self-reported stress level — overwrites any earlier entry for today, same one-per-day shape as mood. */
async function setStressLevel(level: StressLevel): Promise<StressLevelEntry> {
  await fakeDelay(150);
  const now = new Date();
  const todayKey = dateKey(now);
  const entries = readStressLevels().filter((e) => e.createdAt.slice(0, 10) !== todayKey);
  const entry: StressLevelEntry = { level, createdAt: now.toISOString() };
  writeStressLevels([entry, ...entries]);
  return entry;
}

if (!config.useMockServices) {
  throw new AppError('homeService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const homeService = { getWellbeingReflection, getTrackerSignals, setStressLevel };
