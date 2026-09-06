import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { SleepRing } from '../components/SleepRing';
import { useSleepFormat } from '../components/useSleepFormat';
import { stageColor } from '../components/sleepColors';
import { useSleepRecordsQuery } from '../state/useSleepQueries';
import { optimalSleepMinutes } from '../models/sleepContent';
import type { AppError } from '../../../../core/errors';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepQuality'>;

/**
 * Sleep Quality dashboard — the flow's entry screen: overall score + status,
 * "improve now"/suggestions, a Sleep-overview pair of REM/Core rings, and
 * entry points into the chart, schedule, and history. Structure follows the
 * SH Freud "Sleep Quality" home; styling is 100% Sakina tokens/primitives
 * (see sleepContent.ts header re: Figma access / ASSUMPTIONS.md).
 */
export function SleepQualityScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatDuration } = useSleepFormat();
  const query = useSleepRecordsQuery();

  const records = query.data ?? [];
  const latest = records[0];
  const recent = records.slice(0, 7);
  const score = Math.max(
    0,
    Math.min(100, 60 + recent.reduce((sum, r) => sum + r.scoreImpact, 0) * 3),
  );
  const suggestionCount = latest?.suggestionIds.length ?? 0;

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd">{t('sleep.title')}</AppText>
        </View>

        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : (
          <>
            <Card elevation="md" style={{ backgroundColor: theme.colors.brand.primary, gap: theme.spacing.sm }}>
              <AppText variant="label" color={theme.colors.text.onBrand}>
                {t('sleep.scoreLabel')}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.xs }}>
                <AppText variant="displayLg" color={theme.colors.text.onBrand}>
                  {score}
                </AppText>
                <AppText variant="body" color={theme.colors.text.onBrand} style={{ marginBottom: theme.spacing.xs }}>
                  {t('sleep.scoreOutOf')}
                </AppText>
              </View>
              <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                {latest ? t(`sleep.status.${latest.rating}`) : t('sleep.statusNone')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                <Button
                  label={t('sleep.improveNow')}
                  variant="secondary"
                  size="md"
                  onPress={() => navigation.navigate('MySleepSchedule')}
                />
                {suggestionCount > 0 ? (
                  <Button
                    label={t('sleep.suggestionCount', { count: suggestionCount })}
                    variant="secondary"
                    size="md"
                    onPress={() =>
                      latest && navigation.navigate('SleepDetail', { recordId: latest.id })
                    }
                  />
                ) : null}
              </View>
            </Card>

            <Button label={t('sleep.newScheduleCta')} onPress={() => navigation.navigate('NewSleepSchedule')} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText variant="titleMd">{t('sleep.overviewTitle')}</AppText>
              <Button label={t('sleep.seeAll')} variant="ghost" size="md" onPress={() => navigation.navigate('SleepQualityChart')} />
            </View>

            {latest ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <Card style={{ flex: 1, alignItems: 'center', gap: theme.spacing.xs }}>
                  <SleepRing
                    progress={latest.stages.rem / Math.max(1, latest.durationMinutes)}
                    size={104}
                    strokeWidth={10}
                    color={stageColor(theme, 'rem')}
                  >
                    <AppText variant="titleMd">{formatDuration(latest.stages.rem)}</AppText>
                  </SleepRing>
                  <AppText variant="label" color={theme.colors.text.secondary}>
                    {t('sleep.stage.rem')}
                  </AppText>
                </Card>
                <Card style={{ flex: 1, alignItems: 'center', gap: theme.spacing.xs }}>
                  <SleepRing
                    progress={latest.stages.core / Math.max(1, latest.durationMinutes)}
                    size={104}
                    strokeWidth={10}
                    color={stageColor(theme, 'core')}
                  >
                    <AppText variant="titleMd">{formatDuration(latest.stages.core)}</AppText>
                  </SleepRing>
                  <AppText variant="label" color={theme.colors.text.secondary}>
                    {t('sleep.stage.core')}
                  </AppText>
                </Card>
              </View>
            ) : (
              <Card>
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {t('sleep.overviewEmpty')}
                </AppText>
              </Card>
            )}

            {latest ? (
              <Card onPress={() => navigation.navigate('SleepSummary', { recordId: latest.id })}>
                <AppText variant="titleMd">{t('sleep.lastNightTitle')}</AppText>
                <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
                  {t('sleep.lastNightBody', {
                    duration: formatDuration(latest.durationMinutes),
                    goal: formatDuration(optimalSleepMinutes),
                  })}
                </AppText>
              </Card>
            ) : null}

            <View style={{ gap: theme.spacing.xs }}>
              <Button label={t('sleep.mySchedulesCta')} variant="secondary" onPress={() => navigation.navigate('MySleepSchedule')} />
              <Button label={t('sleep.historyCta')} variant="ghost" onPress={() => navigation.navigate('SleepHistory')} />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
