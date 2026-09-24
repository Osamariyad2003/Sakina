import { describe, expect, it } from 'vitest';
import type { StressEntry } from '../../../types/models';
import {
  averageSleepHours,
  evaluateSleepStressLink,
  MIN_ENTRIES,
  SHORT_SLEEP_HOURS,
  type SleepNight,
} from './sleepStressCorrelation';

const stress = (date: string, level: StressEntry['level']): StressEntry =>
  ({ id: `${date}-${level}`, level, createdAt: `${date}T20:00:00.000Z` }) as StressEntry;

const night = (date: string, hours: number): SleepNight => ({ date, durationMinutes: hours * 60 });

describe('evaluateSleepStressLink', () => {
  it('reports the link when stress is clearly higher after short nights', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'high'),
        stress('2026-09-02', 'high'),
        stress('2026-09-03', 'low'),
        stress('2026-09-04', 'low'),
      ],
      [night('2026-09-01', 4), night('2026-09-02', 5), night('2026-09-03', 8), night('2026-09-04', 7.5)],
    );

    expect(verdict.stressHigherAfterShortSleep).toBe(true);
    expect(verdict.reason).toBe('reported');
    expect(verdict.shortSleepMeanWeight).toBe(3);
    expect(verdict.longerSleepMeanWeight).toBe(1);
    expect(verdict.matchedDays).toEqual({ shortSleep: 2, longerSleep: 2 });
  });

  it('reports at exactly the threshold gap (inclusive boundary)', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'medium'),
        stress('2026-09-02', 'medium'),
        stress('2026-09-03', 'medium'),
        stress('2026-09-04', 'low'),
      ],
      [night('2026-09-01', 4), night('2026-09-02', 5), night('2026-09-03', 8), night('2026-09-04', 8)],
    );

    // short mean 2, longer mean 1.5 → difference is exactly MIN_WEIGHT_DIFFERENCE.
    expect(verdict.shortSleepMeanWeight).toBe(2);
    expect(verdict.longerSleepMeanWeight).toBe(1.5);
    expect(verdict.stressHigherAfterShortSleep).toBe(true);
  });

  it('stays silent just below the threshold gap', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'high'),
        stress('2026-09-02', 'medium'),
        stress('2026-09-03', 'medium'),
        stress('2026-09-04', 'medium'),
        stress('2026-09-05', 'medium'),
        stress('2026-09-06', 'medium'),
      ],
      [
        night('2026-09-01', 4),
        night('2026-09-02', 4),
        night('2026-09-03', 4),
        night('2026-09-04', 8),
        night('2026-09-05', 8),
        night('2026-09-06', 8),
      ],
    );

    // short mean 2.33, longer mean 2 → difference 0.33, under the bar.
    expect(verdict.stressHigherAfterShortSleep).toBe(false);
    expect(verdict.reason).toBe('differenceTooSmall');
  });

  it('does not report when both groups are equally stressed', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'medium'),
        stress('2026-09-02', 'medium'),
        stress('2026-09-03', 'medium'),
        stress('2026-09-04', 'medium'),
      ],
      [night('2026-09-01', 4), night('2026-09-02', 5), night('2026-09-03', 8), night('2026-09-04', 8)],
    );

    expect(verdict.stressHigherAfterShortSleep).toBe(false);
    expect(verdict.reason).toBe('differenceTooSmall');
  });

  it('never reports the reverse direction as a link', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'low'),
        stress('2026-09-02', 'low'),
        stress('2026-09-03', 'high'),
        stress('2026-09-04', 'high'),
      ],
      [night('2026-09-01', 4), night('2026-09-02', 5), night('2026-09-03', 8), night('2026-09-04', 8)],
    );

    expect(verdict.stressHigherAfterShortSleep).toBe(false);
    expect(verdict.reason).toBe('differenceTooSmall');
  });

  it(`stays silent below ${MIN_ENTRIES} entries on either side`, () => {
    const entries = [stress('2026-09-01', 'high'), stress('2026-09-02', 'high'), stress('2026-09-03', 'low')];
    const nights = [night('2026-09-01', 4), night('2026-09-02', 4), night('2026-09-03', 8), night('2026-09-04', 8)];

    expect(evaluateSleepStressLink(entries, nights).reason).toBe('notEnoughEntries');
    expect(evaluateSleepStressLink([...entries, stress('2026-09-04', 'low')], nights.slice(0, 3)).reason).toBe(
      'notEnoughEntries',
    );
  });

  it('ignores stress days that have no sleep record rather than assuming one', () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'high'),
        stress('2026-09-05', 'high'),
        stress('2026-09-06', 'high'),
        stress('2026-09-07', 'high'),
      ],
      [night('2026-09-01', 4), night('2026-09-02', 8), night('2026-09-03', 8), night('2026-09-04', 8)],
    );

    expect(verdict.reason).toBe('notEnoughMatchedDays');
    expect(verdict.matchedDays).toEqual({ shortSleep: 1, longerSleep: 0 });
  });

  it(`treats exactly ${SHORT_SLEEP_HOURS}h as a longer night, not a short one`, () => {
    const verdict = evaluateSleepStressLink(
      [
        stress('2026-09-01', 'high'),
        stress('2026-09-02', 'high'),
        stress('2026-09-03', 'low'),
        stress('2026-09-04', 'low'),
      ],
      [
        night('2026-09-01', SHORT_SLEEP_HOURS - 0.5),
        night('2026-09-02', SHORT_SLEEP_HOURS - 0.5),
        night('2026-09-03', SHORT_SLEEP_HOURS),
        night('2026-09-04', SHORT_SLEEP_HOURS),
      ],
    );

    expect(verdict.matchedDays).toEqual({ shortSleep: 2, longerSleep: 2 });
  });

  it('is safe on empty input', () => {
    expect(evaluateSleepStressLink([], []).reason).toBe('notEnoughEntries');
  });
});

describe('averageSleepHours', () => {
  const now = new Date('2026-09-10T12:00:00.000Z').getTime();

  it('averages only nights inside the window', () => {
    const hours = averageSleepHours(
      [night('2026-09-09', 8), night('2026-09-08', 6), night('2026-08-01', 2)],
      7,
      now,
    );
    expect(hours).toBe(7);
  });

  it('returns null when nothing recent was logged', () => {
    expect(averageSleepHours([night('2026-01-01', 8)], 7, now)).toBeNull();
  });

  it('returns null for no records at all', () => {
    expect(averageSleepHours([], 7, now)).toBeNull();
  });
});
