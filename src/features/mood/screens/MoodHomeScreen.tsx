import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, Card, Badge, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { MoodChart } from '../components/MoodChart';
import { moodColor } from '../components/moodColors';
import { useTodayMoodQuery, useMoodHistoryQuery, useMoodTrendQuery } from '../state/useMoodQueries';
import { moodLevels } from '../models/moodContent';
import type { MoodEntry } from '../../../types/models';
import type { MoodStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodHome'>;

/** Consecutive days (ending today) with at least one check-in. */
function computeStreak(entries: MoodEntry[]): number {
  const days = new Set(entries.map((e) => e.createdAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to still count if today isn't logged yet.
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Mood dashboard — current mood + "I'm feeling…", streak/suggestion chips,
 * the weekly mood history chart, and the + check-in. Structure follows the SH
 * Freud Mood home; styling is 100% Sakina tokens/primitives.
 */
export function MoodHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const todayQuery = useTodayMoodQuery();
  const historyQuery = useMoodHistoryQuery();
  const trendQuery = useMoodTrendQuery(7);

  const entries = historyQuery.data ?? [];
  const current = todayQuery.data ?? entries[0] ?? null;
  const option = current ? moodLevels.find((m) => m.level === current.mood) : null;
  const streak = computeStreak(entries);

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('tabs.mood')}</AppText>

        {todayQuery.isLoading ? (
          <SkeletonList rows={2} rowHeight={90} />
        ) : todayQuery.isError ? (
          <ErrorState message={errorText(todayQuery.error, t)} onRetry={() => todayQuery.refetch()} />
        ) : (
          <Card
            elevation="md"
            style={{ backgroundColor: option ? moodColor(theme, option.level) : theme.colors.brand.primary, alignItems: 'center', gap: theme.spacing.xs }}
          >
            <AppText style={{ fontSize: 56 }}>{option?.emoji ?? '🙂'}</AppText>
            <AppText variant="titleLg" color={theme.colors.text.onBrand}>
              {option
                ? t('mood.imFeeling', { mood: isArabic ? option.labelAr : option.labelEn })
                : t('mood.noMoodYet')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
              <Badge label={t('mood.streakChip', { count: streak })} />
              <Badge label={t('mood.noSuggestionsChip')} />
            </View>
          </Card>
        )}

        <Button label={t('mood.newCheckIn')} onPress={() => navigation.navigate('MoodCheckIn')} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="titleMd">{t('mood.historyChartTitle')}</AppText>
          <Button label={t('mood.seeAll')} variant="ghost" size="md" onPress={() => navigation.navigate('MoodHistory')} />
        </View>

        <Card>
          {trendQuery.isLoading ? (
            <SkeletonList rows={1} rowHeight={140} />
          ) : trendQuery.isError ? (
            <ErrorState message={errorText(trendQuery.error, t)} onRetry={() => trendQuery.refetch()} />
          ) : (
            <MoodChart points={trendQuery.data ?? []} />
          )}
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <Button label={t('mood.overviewCta')} variant="secondary" onPress={() => navigation.navigate('MoodOverview')} />
          <Button label={t('mood.insightsCta')} variant="secondary" onPress={() => navigation.navigate('MoodInsights')} />
          <Button label={t('mood.shareCta')} variant="ghost" onPress={() => navigation.navigate('MoodShare')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
