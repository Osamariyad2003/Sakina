import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodColor } from '../components/moodColors';
import { useMoodHistoryQuery } from '../state/useMoodQueries';
import { moodLevels, moodSuggestions, moodLevelWeight } from '../models/moodContent';
import type { MoodLevel, MoodEntry } from '../../../types/models';
import type { MoodStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodInsights'>;

const DAY = 86400000;

function within(entries: MoodEntry[], startDaysAgo: number, endDaysAgo: number) {
  const now = Date.now();
  return entries.filter((e) => {
    const age = now - new Date(e.createdAt).getTime();
    return age >= endDaysAgo * DAY && age < startDaysAgo * DAY;
  });
}

/**
 * Mood Insights — the mood distribution, an AI recommendation, and
 * week-over-week stat cards. Structure follows the SH Freud insights frame;
 * styling is 100% Sakina tokens/primitives. All stats are derived from real
 * local history.
 */
export function MoodInsightsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const historyQuery = useMoodHistoryQuery();
  const entries = historyQuery.data ?? [];
  const featured = moodSuggestions[0];

  const { counts, maxCount, stats } = useMemo(() => {
    const counts: Record<MoodLevel, number> = { veryLow: 0, low: 0, neutral: 0, good: 0, veryGood: 0 };
    for (const e of entries) counts[e.mood] += 1;
    const maxCount = Math.max(1, ...Object.values(counts));

    const thisWeek = within(entries, 7, 0);
    const lastWeek = within(entries, 14, 7);
    const positive = (list: MoodEntry[]) => list.filter((e) => e.mood === 'good' || e.mood === 'veryGood').length;
    const avg = (list: MoodEntry[]) => (list.length ? list.reduce((s, e) => s + moodLevelWeight[e.mood], 0) / list.length : 0);

    const stats = {
      happierRatio: positive(lastWeek) > 0 ? positive(thisWeek) / positive(lastWeek) : positive(thisWeek) > 0 ? positive(thisWeek) : 0,
      checkInsThisWeek: thisWeek.length,
      checkInsDelta: thisWeek.length - lastWeek.length,
      avgImprovementPercent: avg(lastWeek) > 0 ? Math.round(((avg(thisWeek) - avg(lastWeek)) / avg(lastWeek)) * 100) : 0,
    };
    return { counts, maxCount, stats };
  }, [entries]);

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('mood.insightsTitle')}</AppText>

        {historyQuery.isLoading ? (
          <SkeletonList rows={5} />
        ) : historyQuery.isError ? (
          <ErrorState message={errorText(historyQuery.error, t)} onRetry={() => historyQuery.refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState title={t('mood.insightsEmptyTitle')} description={t('mood.insightsEmptyBody')} />
        ) : (
          <>
            <Card style={{ gap: theme.spacing.sm }}>
              <AppText variant="titleMd">{t('mood.distributionTitle')}</AppText>
              {moodLevels.map((m) => (
                <View key={m.level} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                  <AppText style={{ fontSize: 20 }}>{m.emoji}</AppText>
                  <View style={{ flex: 1, height: 10, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.subtle, overflow: 'hidden' }}>
                    <View style={{ width: `${(counts[m.level] / maxCount) * 100}%`, height: '100%', backgroundColor: moodColor(theme, m.level) }} />
                  </View>
                  <AppText variant="bodyStrong" color={theme.colors.text.secondary}>
                    {counts[m.level]}
                  </AppText>
                </View>
              ))}
            </Card>

            <Card
              onPress={() => navigation.navigate('MoodSuggestionDetail', { suggestionId: featured.id })}
              style={{ backgroundColor: theme.colors.brand.primaryDark, gap: theme.spacing.xxs }}
            >
              <AppText variant="label" color={theme.colors.text.onBrand}>
                {t('mood.aiRecommendationLabel')}
              </AppText>
              <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                {isArabic ? featured.titleAr : featured.titleEn}
              </AppText>
              <AppText variant="caption" color={theme.colors.text.onBrand}>
                {t('mood.learnMore')}
              </AppText>
            </Card>

            <AppText variant="titleMd">{t('mood.otherInsights')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <StatCard value={`${stats.happierRatio.toFixed(1)}x`} label={t('mood.statHappier')} />
              <StatCard value={`${stats.avgImprovementPercent >= 0 ? '+' : ''}${stats.avgImprovementPercent}%`} label={t('mood.statImprovement')} />
              <StatCard value={String(stats.checkInsThisWeek)} label={t('mood.statCheckIns')} />
              <StatCard
                value={`${stats.checkInsDelta >= 0 ? '+' : ''}${stats.checkInsDelta}`}
                label={t('mood.statVsLastWeek')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );

  function StatCard({ value, label }: { value: string; label: string }) {
    return (
      <Card style={{ width: '47%', gap: theme.spacing.xxs }}>
        <AppText variant="titleLg">{value}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {label}
        </AppText>
      </Card>
    );
  }
}
