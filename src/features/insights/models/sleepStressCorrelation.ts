import type { StressEntry } from '../../../types/models';
import { stressLevelWeight } from '../../wellness/stress-management/models/stressContent';

/**
 * "Your stress tends to be higher on nights you slept less."
 *
 * This is a **product rule, not a statistical claim**: it compares average
 * self-reported stress on days following a short night against days following
 * a longer one, and only says anything when both groups have enough entries
 * and the gap is wide enough to be worth mentioning. It is not a correlation
 * coefficient, not a significance test, and must never be phrased to the user
 * as a finding about their health.
 *
 * Extracted from `features/home/components/CombinedMetricsCard.tsx`, where the
 * same rule (and these thresholds) lived inside a React component — see
 * docs/architecture-review.md §6.2. Keeping it here means the thresholds are
 * reviewable in one place and testable without rendering anything.
 *
 * Framework-free by design: no React, no i18n, no formatting. It returns a
 * verdict; the caller decides what copy to show.
 */

/** Nights shorter than this are the "short sleep" group. */
export const SHORT_SLEEP_HOURS = 6;

/** Minimum stress entries and sleep records before the rule will look at all. */
export const MIN_ENTRIES = 4;

/** Minimum day-matched samples needed on *each* side of the split. */
export const MIN_SAMPLES_PER_GROUP = 2;

/**
 * Minimum gap in mean stress weight (levels are 1–3) before the difference is
 * worth telling the user about. 0.5 is half a stress level.
 */
export const MIN_WEIGHT_DIFFERENCE = 0.5;

/** Only the fields this rule needs — so it does not depend on the full `SleepRecord`. */
export interface SleepNight {
  /** ISO date (yyyy-mm-dd) the sleep is attributed to. */
  date: string;
  durationMinutes: number;
}

export interface SleepStressVerdict {
  /** True only when the rule has enough matched data AND the gap clears the threshold. */
  stressHigherAfterShortSleep: boolean;
  /** Why the rule stayed silent — useful for debugging, never shown to the user. */
  reason: 'reported' | 'notEnoughEntries' | 'notEnoughMatchedDays' | 'differenceTooSmall';
  /** Mean stress weight after short nights, when it could be computed. */
  shortSleepMeanWeight?: number;
  /** Mean stress weight after longer nights, when it could be computed. */
  longerSleepMeanWeight?: number;
  matchedDays: { shortSleep: number; longerSleep: number };
}

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * Pairs each stress entry with the sleep recorded for the same calendar day,
 * splits those pairs on `SHORT_SLEEP_HOURS`, and compares the group means.
 * Days with no matching sleep record are ignored rather than assumed.
 */
export function evaluateSleepStressLink(
  stressEntries: StressEntry[],
  sleepNights: SleepNight[],
): SleepStressVerdict {
  const empty = { shortSleep: 0, longerSleep: 0 };

  if (stressEntries.length < MIN_ENTRIES || sleepNights.length < MIN_ENTRIES) {
    return { stressHigherAfterShortSleep: false, reason: 'notEnoughEntries', matchedDays: empty };
  }

  const hoursByDay = new Map(sleepNights.map((night) => [night.date, night.durationMinutes / 60]));
  const shortSleepWeights: number[] = [];
  const longerSleepWeights: number[] = [];

  for (const entry of stressEntries) {
    const day = entry.createdAt.slice(0, 10);
    const hours = hoursByDay.get(day);
    if (hours == null) continue;
    const bucket = hours < SHORT_SLEEP_HOURS ? shortSleepWeights : longerSleepWeights;
    bucket.push(stressLevelWeight[entry.level]);
  }

  const matchedDays = { shortSleep: shortSleepWeights.length, longerSleep: longerSleepWeights.length };

  if (shortSleepWeights.length < MIN_SAMPLES_PER_GROUP || longerSleepWeights.length < MIN_SAMPLES_PER_GROUP) {
    return { stressHigherAfterShortSleep: false, reason: 'notEnoughMatchedDays', matchedDays };
  }

  const shortSleepMeanWeight = mean(shortSleepWeights);
  const longerSleepMeanWeight = mean(longerSleepWeights);
  const difference = shortSleepMeanWeight - longerSleepMeanWeight;

  return {
    stressHigherAfterShortSleep: difference >= MIN_WEIGHT_DIFFERENCE,
    reason: difference >= MIN_WEIGHT_DIFFERENCE ? 'reported' : 'differenceTooSmall',
    shortSleepMeanWeight,
    longerSleepMeanWeight,
    matchedDays,
  };
}

/** Mean nightly sleep in hours over `withinDays`, or null when nothing recent was logged. */
export function averageSleepHours(sleepNights: SleepNight[], withinDays = 7, now = Date.now()): number | null {
  const windowMs = withinDays * 24 * 60 * 60 * 1000;
  const recent = sleepNights.filter((night) => now - new Date(night.date).getTime() <= windowMs);
  if (recent.length === 0) return null;
  return mean(recent.map((night) => night.durationMinutes)) / 60;
}
