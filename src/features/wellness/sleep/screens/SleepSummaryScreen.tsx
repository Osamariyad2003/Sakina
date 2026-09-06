import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { SleepRing } from '../components/SleepRing';
import { SleepStageBar } from '../components/SleepStageBar';
import { useSleepFormat } from '../components/useSleepFormat';
import { stageColor } from '../components/sleepColors';
import { useSleepRecordsQuery } from '../state/useSleepQueries';
import { sleepStages, sleepSuggestions, optimalSleepMinutes } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepSummary'>;

/**
 * "Sleep Summary" — the big slept-for value, an overall ring vs the optimal
 * goal, per-stage breakdown, and the night's AI suggestions. Falls back to
 * the latest record when no id is passed (e.g. after a session). Structure
 * follows the SH Freud summary frame; styling is 100% Sakina tokens/
 * primitives.
 */
export function SleepSummaryScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { formatDuration } = useSleepFormat();
  const query = useSleepRecordsQuery();

  const records = query.data ?? [];
  const record = route.params?.recordId ? records.find((r) => r.id === route.params?.recordId) : records[0];

  const suggestions = record ? sleepSuggestions.filter((s) => record.suggestionIds.includes(s.id)) : [];

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        {query.isLoading ? (
          <SkeletonList rows={5} />
        ) : !record ? (
          <EmptyState title={t('sleep.summaryEmptyTitle')} description={t('sleep.summaryEmptyBody')} />
        ) : (
          <>
            <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('sleep.youSleptFor')}
              </AppText>
              <AppText variant="displayLg">{formatDuration(record.durationMinutes)}</AppText>
            </View>

            <View style={{ alignItems: 'center' }}>
              <SleepRing progress={record.durationMinutes / optimalSleepMinutes} size={180} strokeWidth={16}>
                <View style={{ alignItems: 'center' }}>
                  <AppText variant="titleLg">
                    {Math.min(100, Math.round((record.durationMinutes / optimalSleepMinutes) * 100))}%
                  </AppText>
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {t('sleep.ofGoal')}
                  </AppText>
                </View>
              </SleepRing>
            </View>

            <Card style={{ gap: theme.spacing.sm }}>
              <SleepStageBar stages={record.stages} height={12} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                {sleepStages.map((stage) => (
                  <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                    <View style={{ width: 10, height: 10, borderRadius: theme.radius.pill, backgroundColor: stageColor(theme, stage) }} />
                    <AppText variant="caption" color={theme.colors.text.secondary}>
                      {t(`sleep.stage.${stage}`)} · {formatDuration(record.stages[stage])}
                    </AppText>
                  </View>
                ))}
              </View>
            </Card>

            {suggestions.length > 0 ? (
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="titleMd">{t('sleep.aiSuggestionsTitle')}</AppText>
                {suggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    onPress={() => navigation.navigate('SleepSuggestionDetail', { suggestionId: suggestion.id })}
                    style={{ gap: theme.spacing.xxs }}
                  >
                    <AppText variant="bodyStrong">{isArabic ? suggestion.titleAr : suggestion.titleEn}</AppText>
                    <AppText variant="caption" color={theme.colors.text.secondary}>
                      {isArabic ? suggestion.summaryAr : suggestion.summaryEn}
                    </AppText>
                  </Card>
                ))}
              </View>
            ) : null}

            <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
              <Button label={t('sleep.seeDetail')} variant="secondary" onPress={() => navigation.navigate('SleepDetail', { recordId: record.id })} />
              <Button label={t('sleep.done')} onPress={() => navigation.navigate('SleepQuality')} />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
