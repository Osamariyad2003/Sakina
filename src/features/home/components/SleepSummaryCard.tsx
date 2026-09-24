import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useSleepRecordsQuery } from '../../wellness/sleep/state/useSleepQueries';
import { MoodChart } from '../../mood/components/MoodChart';
import type { TrendPoint } from '../../mood/services/moodService';
import { errorText } from '../../../core/errors';

const DAY = 86400000;
/** Charted 0-10 hours — MoodChart's `maxValue` ceiling, not a sleep-goal claim. */
const MAX_HOURS = 10;

/**
 * Sleep's Home summary — same card shape/chart Mood and Stress use (Feature
 * 6/2's "keep visually consistent"), charted in hours instead of a 1-5/1-3
 * weight. Sleep had no Home presence at all before this; `sleepService` has
 * no `getTrend` of its own, so the 7-day points are built here from
 * `SleepRecord.date`/`durationMinutes` directly.
 */
export function SleepSummaryCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useSleepRecordsQuery();

  const trend = useMemo<TrendPoint[]>(() => {
    const records = query.data ?? [];
    const byDate = new Map(records.map((r) => [r.date, r.durationMinutes / 60]));
    const points: TrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
      points.push({ date, averageWeight: byDate.get(date) ?? null });
    }
    return points;
  }, [query.data]);

  return (
    <Card
      // Tinted block per the reference carousel. Sakina's accents are soft
      // pastels, so body text keeps its normal dark colour on top.
      style={{ width: 280, minHeight: 150, backgroundColor: theme.colors.accent.sleep }}
      elevation="md"
    >
      <AppText variant="label" color={theme.colors.text.secondary}>
        {t('home.sleepSummaryCardTitle')}
      </AppText>
      <View style={{ marginTop: theme.spacing.xs }}>
        {query.isLoading ? (
          <SkeletonList rows={2} rowHeight={16} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : (
          <MoodChart points={trend} height={90} maxValue={MAX_HOURS} />
        )}
      </View>
    </Card>
  );
}
