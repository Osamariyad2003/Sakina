import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, SegmentedControl, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { MoodChart } from '../components/MoodChart';
import { MoodBubbles } from '../components/MoodBubbles';
import { moodColor } from '../components/moodColors';
import { useMoodHistoryQuery, useMoodTrendQuery } from '../state/useMoodQueries';
import { moodLevels } from '../models/moodContent';
import type { MoodLevel } from '../../../types/models';
import type { AppError } from '../../../core/errors';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodOverview'>;

type Range = 'day' | 'week' | 'month' | 'year' | 'all';
const rangeDays: Record<Range, number> = { day: 1, week: 7, month: 30, year: 365, all: Infinity };

function emptyCounts(): Record<MoodLevel, number> {
  return { veryLow: 0, low: 0, neutral: 0, good: 0, veryGood: 0 };
}

/**
 * Mood Overview — range tabs, the trend chart, total check-ins, and the mood
 * distribution bubbles. Structure follows the SH Freud overview frame;
 * styling is 100% Sakina tokens/primitives.
 */
export function MoodOverviewScreen(_props: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const [range, setRange] = useState<Range>('week');
  const historyQuery = useMoodHistoryQuery();
  const trendQuery = useMoodTrendQuery(range === 'day' || range === 'week' ? 7 : 30);

  const entries = historyQuery.data ?? [];
  const { counts, total } = useMemo(() => {
    const now = Date.now();
    const days = rangeDays[range];
    const counts = emptyCounts();
    let total = 0;
    for (const e of entries) {
      if (days !== Infinity && now - new Date(e.createdAt).getTime() > days * 86400000) continue;
      counts[e.mood] += 1;
      total += 1;
    }
    return { counts, total };
  }, [entries, range]);

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('mood.overviewTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('mood.totalCheckIns', { count: entries.length })}
        </AppText>

        <SegmentedControl
          segments={[
            { key: 'day', label: t('mood.range1Day') },
            { key: 'week', label: t('mood.range1Week') },
            { key: 'month', label: t('mood.range1Month') },
            { key: 'year', label: t('mood.range1Year') },
            { key: 'all', label: t('mood.rangeAllTime') },
          ]}
          value={range}
          onChange={(k) => setRange(k as Range)}
        />

        <Card>
          {trendQuery.isLoading ? (
            <SkeletonList rows={1} rowHeight={140} />
          ) : trendQuery.isError ? (
            <ErrorState message={(trendQuery.error as AppError).message} onRetry={() => trendQuery.refetch()} />
          ) : (
            <MoodChart points={trendQuery.data ?? []} />
          )}
        </Card>

        {historyQuery.isLoading ? (
          <SkeletonList rows={2} />
        ) : total === 0 ? (
          <EmptyState title={t('mood.overviewEmptyTitle')} description={t('mood.overviewEmptyBody')} />
        ) : (
          <>
            <Card style={{ alignItems: 'center', gap: theme.spacing.md }}>
              <MoodBubbles counts={counts} />
            </Card>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.sm }}>
              {moodLevels.map((m) => (
                <View key={m.level} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                  <View style={{ width: 10, height: 10, borderRadius: theme.radius.pill, backgroundColor: moodColor(theme, m.level) }} />
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {isArabic ? m.labelAr : m.labelEn}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
