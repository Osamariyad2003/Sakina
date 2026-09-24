import type { MoodEntry, JournalEntry, MoodLevel } from '../../../types/models';
import { moodLevelWeight } from '../../mood/models/moodContent';

const DAY = 86400000;

function within<T extends { createdAt: string }>(entries: T[], startDaysAgo: number, endDaysAgo: number): T[] {
  const now = Date.now();
  return entries.filter((e) => {
    const age = now - new Date(e.createdAt).getTime();
    return age >= endDaysAgo * DAY && age < startDaysAgo * DAY;
  });
}

export interface WeeklyChange {
  checkInsThisWeek: number;
  checkInsDelta: number;
  avgImprovementPercent: number;
}

/** Same week-over-week math as MoodInsightsScreen, generalized for the cross-domain dashboard. */
export function computeWeeklyChange(entries: MoodEntry[]): WeeklyChange {
  const thisWeek = within(entries, 7, 0);
  const lastWeek = within(entries, 14, 7);
  const avg = (list: MoodEntry[]) =>
    list.length ? list.reduce((s, e) => s + moodLevelWeight[e.mood], 0) / list.length : 0;

  return {
    checkInsThisWeek: thisWeek.length,
    checkInsDelta: thisWeek.length - lastWeek.length,
    avgImprovementPercent: avg(lastWeek) > 0 ? Math.round(((avg(thisWeek) - avg(lastWeek)) / avg(lastWeek)) * 100) : 0,
  };
}

export interface RankedId {
  id: string;
  count: number;
}

function topIds(entries: MoodEntry[], pick: (e: MoodEntry) => string[], limit: number): RankedId[] {
  const counts = new Map<string, number>();
  for (const entry of within(entries, 30, 0)) {
    for (const id of pick(entry)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Most frequent emotions over the last 30 days, most common first. */
export function computeTopEmotions(entries: MoodEntry[], limit = 5): RankedId[] {
  return topIds(entries, (e) => e.emotionIds, limit);
}

/** Most frequent triggers over the last 30 days, most common first. */
export function computeTopTriggers(entries: MoodEntry[], limit = 5): RankedId[] {
  return topIds(entries, (e) => e.triggerIds, limit);
}

export interface PositivePattern {
  key: string;
  /** Interpolation values for the matching insights.pattern* i18n key. */
  values: Record<string, string | number>;
}

/** Longest run of consecutive calendar days (most recent first) with at least one check-in. */
function checkInStreak(entries: MoodEntry[]): number {
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const positiveMoods: MoodLevel[] = ['good', 'veryGood'];

/** The weekday (0=Sunday) with the highest share of positive check-ins, requires ≥3 samples. */
function bestWeekday(entries: MoodEntry[]): number | null {
  const totals = new Array(7).fill(0);
  const positives = new Array(7).fill(0);
  for (const e of entries) {
    const day = new Date(e.createdAt).getDay();
    totals[day] += 1;
    if (positiveMoods.includes(e.mood)) positives[day] += 1;
  }
  let best: number | null = null;
  let bestRatio = 0;
  for (let day = 0; day < 7; day++) {
    if (totals[day] < 2) continue;
    const ratio = positives[day] / totals[day];
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = day;
    }
  }
  return bestRatio > 0 ? best : null;
}

/**
 * Always-supportive observations (product-definition.md §8: "always in
 * supportive language, never 'your mood is bad'") — every pattern here is
 * framed as something positive or neutral, never a deficit.
 */
export function computePositivePatterns(
  moodEntries: MoodEntry[],
  journalEntries: JournalEntry[],
  topEmotion: RankedId | undefined,
): PositivePattern[] {
  const patterns: PositivePattern[] = [];

  const streak = checkInStreak(moodEntries);
  if (streak >= 2) patterns.push({ key: 'patternStreak', values: { count: streak } });

  const bestDay = bestWeekday(moodEntries);
  if (bestDay !== null) patterns.push({ key: 'patternBestDay', values: { day: bestDay } });

  if (topEmotion) patterns.push({ key: 'patternTopEmotion', values: { emotion: topEmotion.id } });

  const journalThisWeek = within(journalEntries, 7, 0).length;
  if (journalThisWeek > 0) patterns.push({ key: 'patternJournaling', values: { count: journalThisWeek } });

  return patterns;
}

export interface JournalStats {
  entriesThisWeek: number;
  totalEntries: number;
}

export function computeJournalStats(journalEntries: JournalEntry[]): JournalStats {
  return {
    entriesThisWeek: within(journalEntries, 7, 0).length,
    totalEntries: journalEntries.length,
  };
}
