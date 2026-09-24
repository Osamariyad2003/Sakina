import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { SleepStageChart, type FanSegment } from '../components/SleepStageChart';
import { ratingColor } from '../components/sleepColors';
import { useSleepRecordsQuery } from '../state/useSleepQueries';
import { sleepQualityRatings } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepQualityChart'>;

/**
 * The "Sleep Quality" fan chart + legend + month-over-month delta. Segments
 * are the distribution of night ratings; the fan is drawn with our own
 * `SleepStageChart` (react-native-svg, RTL-mirrored). Structure follows the
 * SH Freud chart frame; styling is 100% Sakina tokens/primitives.
 */
export function SleepQualityChartScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useSleepRecordsQuery();
  const records = query.data ?? [];

  const counts = sleepQualityRatings.map((rating) => ({
    rating,
    count: records.filter((r) => r.rating === rating).length,
  }));
  const segments: FanSegment[] = counts
    .filter((c) => c.count > 0)
    .map((c) => ({ key: c.rating, value: c.count, color: ratingColor(theme, c.rating) }));

  // Simple month-over-month signal: recent half vs older half average impact.
  const half = Math.ceil(records.length / 2);
  const recentAvg = avg(records.slice(0, half).map((r) => r.scoreImpact));
  const olderAvg = avg(records.slice(half).map((r) => r.scoreImpact));
  const deltaPercent = olderAvg === 0 ? 0 : Math.round(((recentAvg - olderAvg) / Math.abs(olderAvg)) * 100);

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <Button label={t('sleep.back')} variant="ghost" size="md" onPress={() => navigation.goBack()} />
        </View>

        <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
          <AppText variant="displayMd">{t('sleep.title')}</AppText>
          {records.length > 0 ? (
            <AppText variant="body" color={theme.colors.text.secondary}>
              {deltaPercent >= 0
                ? t('sleep.chartBetter', { percent: Math.abs(deltaPercent) })
                : t('sleep.chartWorse', { percent: Math.abs(deltaPercent) })}
            </AppText>
          ) : null}
        </View>

        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : records.length === 0 ? (
          <EmptyState title={t('sleep.chartEmptyTitle')} description={t('sleep.chartEmptyBody')} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.sm }}>
              {counts.map((c) => (
                <View key={c.rating} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: theme.radius.pill,
                      backgroundColor: ratingColor(theme, c.rating),
                    }}
                  />
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {t(`sleep.rating.${c.rating}`)}
                  </AppText>
                </View>
              ))}
            </View>

            <Card style={{ alignItems: 'center' }}>
              <SleepStageChart segments={segments} />
            </Card>

            <Button label={t('sleep.historyCta')} variant="secondary" onPress={() => navigation.navigate('SleepHistory')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
