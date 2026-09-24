import React from 'react';
import { View, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Chip, Button, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { MoodChart } from '../../mood/components/MoodChart';
import { emotionCatalog, triggerCatalog } from '../../mood/models/moodContent';
import { useInsightsQuery } from '../state/useInsightsQuery';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Insights'>,
  BottomTabScreenProps<AppTabsParamList>
>;

function labelFor(catalog: { id: string; labelAr: string; labelEn: string }[], id: string, isArabic: boolean) {
  const match = catalog.find((c) => c.id === id);
  if (!match) return id;
  return isArabic ? match.labelAr : match.labelEn;
}

/**
 * Cross-domain Insights dashboard (product-definition.md §8) — the one
 * consumer that turns Mood *and* Journal data into supportive patterns.
 * Distinct from the mood-only MoodInsightsScreen: this reads across
 * features and always speaks in non-judgmental language (never "your mood
 * is bad" — spec's explicit business rule).
 */
export function InsightsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const insights = useInsightsQuery();

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ gap: theme.spacing.xxs }}>
          <AppText variant="displayMd">{t('insights.title')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {t('insights.subtitle')}
          </AppText>
        </View>

        {insights.isLoading ? (
          <SkeletonList rows={6} />
        ) : insights.isError ? (
          <ErrorState message={errorText(insights.error, t)} onRetry={() => insights.refetch()} />
        ) : insights.isEmpty ? (
          <EmptyState
            title={t('insights.emptyTitle')}
            description={t('insights.emptyBody')}
            icon={<AnimatedLottie source={require('../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
          />
        ) : (
          <>
            <Card style={{ gap: theme.spacing.sm }}>
              <AppText variant="titleMd">{t('insights.trendTitle')}</AppText>
              <MoodChart points={insights.trend} />
            </Card>

            <View style={{ gap: theme.spacing.sm }}>
              <AppText variant="titleMd">{t('insights.weeklyChangeTitle')}</AppText>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <StatCard value={String(insights.weeklyChange.checkInsThisWeek)} label={t('insights.statCheckIns')} />
                <StatCard
                  value={`${insights.weeklyChange.checkInsDelta >= 0 ? '+' : ''}${insights.weeklyChange.checkInsDelta}`}
                  label={t('insights.statVsLastWeek')}
                />
                <StatCard
                  value={`${insights.weeklyChange.avgImprovementPercent >= 0 ? '+' : ''}${insights.weeklyChange.avgImprovementPercent}%`}
                  label={t('insights.statImprovement')}
                />
              </View>
            </View>

            <Card style={{ gap: theme.spacing.sm }}>
              <AppText variant="titleMd">{t('insights.frequentEmotionsTitle')}</AppText>
              {insights.topEmotions.length === 0 ? (
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {t('insights.frequentEmotionsEmpty')}
                </AppText>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {insights.topEmotions.map((e) => (
                    <Chip key={e.id} label={`${labelFor(emotionCatalog, e.id, isArabic)} · ${e.count}`} selected />
                  ))}
                </View>
              )}
            </Card>

            <Card style={{ gap: theme.spacing.sm }}>
              <AppText variant="titleMd">{t('insights.commonTriggersTitle')}</AppText>
              {insights.topTriggers.length === 0 ? (
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {t('insights.commonTriggersEmpty')}
                </AppText>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {insights.topTriggers.map((tr) => (
                    <Chip key={tr.id} label={`${labelFor(triggerCatalog, tr.id, isArabic)} · ${tr.count}`} />
                  ))}
                </View>
              )}
            </Card>

            {insights.positivePatterns.length > 0 ? (
              <Card style={{ gap: theme.spacing.xs }}>
                <AppText variant="titleMd">{t('insights.positivePatternsTitle')}</AppText>
                {insights.positivePatterns.map((p) => (
                  <AppText key={p.key} variant="body">
                    •{' '}
                    {t(`insights.${p.key}`, {
                      ...p.values,
                      day: typeof p.values.day === 'number' ? t(`insights.weekday.${p.values.day}`) : undefined,
                      emotion:
                        typeof p.values.emotion === 'string'
                          ? labelFor(emotionCatalog, p.values.emotion, isArabic)
                          : undefined,
                    })}
                  </AppText>
                ))}
              </Card>
            ) : null}

            <Card
              onPress={() =>
                navigation.navigate('MoodTab', { screen: 'MoodSuggestionDetail', params: { suggestionId: insights.suggestion.id } })
              }
              style={{ backgroundColor: theme.colors.brand.primaryDark, gap: theme.spacing.xxs }}
            >
              <AppText variant="label" color={theme.colors.text.onBrand}>
                {t('insights.suggestionLabel')}
              </AppText>
              <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                {isArabic ? insights.suggestion.titleAr : insights.suggestion.titleEn}
              </AppText>
              <AppText variant="caption" color={theme.colors.text.onBrand}>
                {t('insights.suggestionCta')}
              </AppText>
            </Card>

            <Card onPress={() => navigation.navigate('JournalTab', { screen: 'JournalList' })} style={{ gap: theme.spacing.xxs }}>
              <AppText variant="titleMd">{t('insights.journalSnapshotTitle')}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('insights.journalSnapshotBody', {
                  count: insights.journalStats.entriesThisWeek,
                  total: insights.journalStats.totalEntries,
                })}
              </AppText>
            </Card>

            <Button
              label={t('insights.wellnessCta')}
              variant="secondary"
              onPress={() => navigation.navigate('WellnessTab', { screen: 'WellnessHome' })}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );

  function StatCard({ value, label }: { value: string; label: string }) {
    return (
      <Card style={{ flex: 1, gap: theme.spacing.xxs }}>
        <AppText variant="titleLg">{value}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {label}
        </AppText>
      </Card>
    );
  }
}
