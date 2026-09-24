import type { MoodEntry } from '../../../types/models';
import { moodLevelWeight } from './moodContent';

/**
 * Daily average mood weight over a window — the rule behind MoodChart.
 *
 * Lifted out of `services/moodService.ts`, where it sat next to axios calls
 * and storage reads (docs/architecture-review.md §6.1). It is a pure function
 * of entries: no clock reads beyond the `now` you pass in, no I/O, no
 * formatting.
 */

export interface TrendPoint {
  /** YYYY-MM-DD. */
  date: string;
  /** null = nothing logged that day, which charts render as a gap, not a zero. */
  averageWeight: number | null;
}

const isoDay = (value: Date | string): string =>
  (typeof value === 'string' ? value : value.toISOString()).slice(0, 10);

/** Oldest day first, one point per day in the window, including empty days. */
export function buildMoodTrend(entries: MoodEntry[], days: number, now = new Date()): TrendPoint[] {
  const weightsByDay = new Map<string, number[]>();
  for (const entry of entries) {
    const day = isoDay(entry.createdAt);
    const bucket = weightsByDay.get(day);
    if (bucket) bucket.push(moodLevelWeight[entry.mood]);
    else weightsByDay.set(day, [moodLevelWeight[entry.mood]]);
  }

  const points: TrendPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    const day = isoDay(date);
    const weights = weightsByDay.get(day);
    points.push({
      date: day,
      averageWeight: weights ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length : null,
    });
  }
  return points;
}

/** True when both timestamps fall on the same calendar day. */
export function isSameDay(a: string, b: string): boolean {
  return isoDay(a) === isoDay(b);
}
