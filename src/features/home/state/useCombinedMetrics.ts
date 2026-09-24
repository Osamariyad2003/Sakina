import { useMemo } from 'react';
import { useTodayMoodQuery } from '../../mood/state/useMoodQueries';
import { moodLevels, type MoodLevelOption } from '../../mood/models/moodContent';
import {
  useStressHistoryQuery,
  useTodayStressQuery,
} from '../../wellness/stress-management/state/useStressCheckInQueries';
import { stressLevelOptions, type StressLevelOption } from '../../wellness/stress-management/models/stressContent';
import { useSleepRecordsQuery } from '../../wellness/sleep/state/useSleepQueries';
import {
  averageSleepHours,
  evaluateSleepStressLink,
  type SleepStressVerdict,
} from '../../insights/models/sleepStressCorrelation';

/**
 * Home's cross-feature read, in one place.
 *
 * Home legitimately summarises other features, but it was doing so from
 * inside a component that imported four hooks and two content modules across
 * three features (docs/architecture-review.md §6.5 / R5). Aggregation is
 * application-layer work: this hook owns the fan-out and the rule calls, and
 * hands the component a view model it only has to render.
 *
 * A change to how Mood exposes "today" now breaks one hook, not a card.
 */

export interface CombinedMetrics {
  /** Today's logged mood, or null when nothing is logged yet. */
  mood: MoodLevelOption | null;
  /** Today's self-reported stress, or null. */
  stress: StressLevelOption | null;
  /** Mean nightly sleep over the last week, or null when nothing recent was logged. */
  averageSleepHours: number | null;
  /** Whether to show the sleep↔stress callout, and why. */
  sleepStress: SleepStressVerdict;
  isLoading: boolean;
}

export function useCombinedMetrics(): CombinedMetrics {
  const todayMoodQuery = useTodayMoodQuery();
  const todayStressQuery = useTodayStressQuery();
  const stressHistoryQuery = useStressHistoryQuery();
  const sleepRecordsQuery = useSleepRecordsQuery();

  const mood = todayMoodQuery.data
    ? (moodLevels.find((option) => option.level === todayMoodQuery.data!.mood) ?? null)
    : null;

  const stress = todayStressQuery.data
    ? (stressLevelOptions.find((option) => option.level === todayStressQuery.data!.level) ?? null)
    : null;

  const sleepHours = useMemo(
    () => averageSleepHours(sleepRecordsQuery.data ?? []),
    [sleepRecordsQuery.data],
  );

  const sleepStress = useMemo(
    () => evaluateSleepStressLink(stressHistoryQuery.data ?? [], sleepRecordsQuery.data ?? []),
    [stressHistoryQuery.data, sleepRecordsQuery.data],
  );

  return {
    mood,
    stress,
    averageSleepHours: sleepHours,
    sleepStress,
    isLoading:
      todayMoodQuery.isLoading ||
      todayStressQuery.isLoading ||
      stressHistoryQuery.isLoading ||
      sleepRecordsQuery.isLoading,
  };
}
