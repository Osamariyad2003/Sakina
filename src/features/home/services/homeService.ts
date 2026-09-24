import { moodService } from '../../mood/services/moodService';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { moodLevelWeight } from '../../mood/models/moodContent';
import { journalService } from '../../journal/services/journalService';
import { stressService } from '../../wellness/stress-management/services/stressService';
import { stressCheckInService } from '../../wellness/stress-management/services/stressCheckInService';
import { wellnessSessionService } from '../../wellness/services/wellnessSessionService';
import { stressLevelWeight } from '../../wellness/stress-management/models/stressContent';
import { reflectionTemplates, type WellbeingReflection, type TrackerSignal } from '../models/homeContent';
import type { MoodEntry, StressEntry, StressLevel } from '../../../types/models';

/**
 * Mostly derived/composed data, reading through the existing mock services
 * (mood/journal/stress — each already carries its own `config
 * .useMockServices` guard). The self-reported Stress Level tracker now
 * reads/writes through `stressCheckInService` (features/wellness/
 * stress-management) instead of keeping its own parallel store, so Home's
 * quick-set widget and the full Stress check-in/history feature always
 * agree on what "today's stress" is. This file keeps its own guard too,
 * same pattern as journal/mood/companion/stress. `fakeDelay` matches the
 * same pattern so Home's cards exercise real loading states.
 */


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
  await simulateLatency();
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
  await simulateLatency();
  const [moodEntries, journalEntries, stressSessions, wellnessSessions, stressEntries] = await Promise.all([
    moodService.listEntries(),
    journalService.list(),
    stressService.listSessions(),
    wellnessSessionService.listSessions(),
    stressCheckInService.listEntries(),
  ]);

  const days = lastNDayKeys(7);
  const moodDays = new Set(moodEntries.map((e) => e.createdAt.slice(0, 10)));
  const journalDays = new Set(journalEntries.map((e) => e.createdAt.slice(0, 10)));
  const minutesByDay: Record<string, number> = {};
  // Both Stress Management technique sessions *and* general Wellness exercise
  // completions count toward "mindful minutes" — see wellnessSessionService's
  // module doc for why the latter wasn't recorded anywhere until now.
  for (const s of stressSessions) {
    const key = (s.completedAt ?? s.startedAt).slice(0, 10);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + s.durationSeconds / 60;
  }
  for (const s of wellnessSessions) {
    const key = s.completedAt.slice(0, 10);
    minutesByDay[key] = (minutesByDay[key] ?? 0) + s.durationSeconds / 60;
  }
  // Oldest-first so, when several check-ins land on the same day, the last write wins (today's *latest* level).
  const stressLevelByDay: Record<string, StressLevel> = {};
  for (const entry of [...stressEntries].reverse()) {
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

/**
 * Sets *today's* self-reported stress level from Home's quick-set widget —
 * a plain `createEntry` with no triggers/note, same store the full Stress
 * check-in screen writes to (`stressCheckInService`). Tracker signals read
 * back the latest same-day entry, so this "just wins" without needing to
 * delete anything first.
 */
async function setStressLevel(level: StressLevel): Promise<StressEntry> {
  await simulateLatency(150);
  return stressCheckInService.createEntry({ level });
}

// Aggregates the other services (live when the real API is on); nothing backend-specific
// to switch.

export const homeService = { getWellbeingReflection, getTrackerSignals, setStressLevel };
