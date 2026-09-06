import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { SleepRing } from '../components/SleepRing';
import { useSleepFormat } from '../components/useSleepFormat';
import { stageColor } from '../components/sleepColors';
import { useSleepRecordQuery, useDeleteSleepRecordMutation } from '../state/useSleepQueries';
import { sleepStages, sleepSuggestions, totalStageMinutes, optimalSleepMinutes } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepDetail'>;

/**
 * "Sleep Detail" — schedule (bed/wake), a per-stage overview with
 * percentages, the score impact, and this night's suggestions, with a
 * delete-from-history action. Structure follows the SH Freud detail frame;
 * styling is 100% Sakina tokens/primitives.
 */
export function SleepDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { formatDuration, formatTime } = useSleepFormat();
  const query = useSleepRecordQuery(route.params.recordId);
  const deleteRecord = useDeleteSleepRecordMutation();

  const record = query.data;

  if (query.isLoading) {
    return (
      <Screen>
        <SkeletonList rows={6} />
      </Screen>
    );
  }

  if (!record) {
    return (
      <Screen>
        <EmptyState title={t('sleep.notFound')} />
      </Screen>
    );
  }

  const asleep = totalStageMinutes(record.stages);
  const suggestions = sleepSuggestions.filter((s) => record.suggestionIds.includes(s.id));

  const remove = async () => {
    try {
      await deleteRecord.mutateAsync(record.id);
    } finally {
      navigation.goBack();
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.detailTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {record.date}
        </AppText>

        <View style={{ alignItems: 'center' }}>
          <SleepRing progress={record.durationMinutes / optimalSleepMinutes} size={176} strokeWidth={16}>
            <AppText variant="displayMd">{formatDuration(record.durationMinutes)}</AppText>
          </SleepRing>
        </View>

        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="titleMd">{t('sleep.scheduleSectionTitle')}</AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="body" color={theme.colors.text.secondary}>
              {t('sleep.goToBed')}
            </AppText>
            <AppText variant="bodyStrong">{formatTime(record.bedtime)}</AppText>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="body" color={theme.colors.text.secondary}>
              {t('sleep.wakeUp')}
            </AppText>
            <AppText variant="bodyStrong">{formatTime(record.wakeTime)}</AppText>
          </View>
        </Card>

        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="titleMd">{t('sleep.overviewSectionTitle')}</AppText>
          {sleepStages.map((stage) => {
            const minutes = record.stages[stage];
            const percent = asleep > 0 ? Math.round((minutes / asleep) * 100) : 0;
            return (
              <View key={stage} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <View style={{ width: 12, height: 12, borderRadius: theme.radius.pill, backgroundColor: stageColor(theme, stage) }} />
                <AppText variant="body" style={{ flex: 1 }}>
                  {t(`sleep.stage.${stage}`)}
                </AppText>
                <AppText variant="bodyStrong" color={theme.colors.text.secondary}>
                  {percent}% · {formatDuration(minutes)}
                </AppText>
              </View>
            );
          })}
        </Card>

        <Card style={{ gap: theme.spacing.xxs }}>
          <AppText variant="titleMd" color={record.scoreImpact >= 0 ? theme.colors.status.success : theme.colors.status.error}>
            {record.scoreImpact >= 0 ? `+${record.scoreImpact}` : record.scoreImpact} {t('sleep.scoreImpactLabel')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {record.scoreImpact >= 0 ? t('sleep.scoreImpactPositive') : t('sleep.scoreImpactNegative')}
          </AppText>
        </Card>

        {suggestions.length > 0 ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="titleMd">{t('sleep.aiSuggestionsTitle')}</AppText>
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                onPress={() => navigation.navigate('SleepSuggestionDetail', { suggestionId: suggestion.id })}
              >
                <AppText variant="bodyStrong">{isArabic ? suggestion.titleAr : suggestion.titleEn}</AppText>
              </Card>
            ))}
          </View>
        ) : null}

        <Button label={t('sleep.deleteFromHistory')} variant="destructive" loading={deleteRecord.isPending} onPress={remove} />
      </ScrollView>
    </Screen>
  );
}
