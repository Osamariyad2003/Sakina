import React from 'react';
import { View, ScrollView, Switch } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useSleepFormat } from '../components/useSleepFormat';
import { SleepStageBar } from '../components/SleepStageBar';
import { ratingColor } from '../components/sleepColors';
import {
  useSleepSchedulesQuery,
  useToggleSleepScheduleMutation,
  useSleepRecordsQuery,
} from '../state/useSleepQueries';
import { scheduleDurationMinutes, sleepSuggestions } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'MySleepSchedule'>;

/**
 * "My Sleep Schedule" — the schedule list (each toggleable), a Start Sleeping
 * CTA, an AI-suggestion shortcut, and a sleep-history preview. Structure
 * follows the SH Freud schedule frame; styling is 100% Sakina tokens/
 * primitives.
 */
export function MySleepScheduleScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatTime, formatDuration } = useSleepFormat();
  const schedulesQuery = useSleepSchedulesQuery();
  const recordsQuery = useSleepRecordsQuery();
  const toggle = useToggleSleepScheduleMutation();

  const schedules = schedulesQuery.data ?? [];
  const records = recordsQuery.data ?? [];
  const featuredSuggestion = sleepSuggestions[0];

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.mySchedulesTitle')}</AppText>

        <Button label={t('sleep.startSleeping')} onPress={() => navigation.navigate('SleepSession', {})} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="titleMd">{t('sleep.upcomingSchedule')}</AppText>
          <Button label={t('sleep.addSchedule')} variant="ghost" size="md" onPress={() => navigation.navigate('NewSleepSchedule')} />
        </View>

        {schedulesQuery.isLoading ? (
          <SkeletonList rows={3} />
        ) : schedulesQuery.isError ? (
          <ErrorState message={errorText(schedulesQuery.error, t)} onRetry={() => schedulesQuery.refetch()} />
        ) : schedules.length === 0 ? (
          <EmptyState
            title={t('sleep.schedulesEmptyTitle')}
            description={t('sleep.schedulesEmptyBody')}
            actionLabel={t('sleep.newScheduleCta')}
            onAction={() => navigation.navigate('NewSleepSchedule')}
          />
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ gap: theme.spacing.xxs }}>
                <AppText variant="titleMd">{formatTime(schedule.wakeTime)}</AppText>
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {t('sleep.bedToWake', {
                    bedtime: formatTime(schedule.bedtime),
                    duration: formatDuration(scheduleDurationMinutes(schedule.bedtime, schedule.wakeTime)),
                  })}
                </AppText>
              </View>
              <Switch
                value={schedule.enabled}
                onValueChange={(enabled) => toggle.mutate({ id: schedule.id, enabled })}
                trackColor={{ true: theme.colors.brand.primary, false: theme.colors.border.default }}
                thumbColor={theme.colors.background.surface}
              />
            </Card>
          ))
        )}

        <Card
          onPress={() => navigation.navigate('SleepSuggestionDetail', { suggestionId: featuredSuggestion.id })}
          style={{ backgroundColor: theme.colors.brand.primaryDark }}
        >
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('sleep.aiSuggestionsTitle')}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
            {t('sleep.aiSuggestionsSubtitle')}
          </AppText>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="titleMd">{t('sleep.historyTitle')}</AppText>
          <Button label={t('sleep.seeAll')} variant="ghost" size="md" onPress={() => navigation.navigate('SleepHistory')} />
        </View>

        {records.slice(0, 3).map((record) => (
          <Card key={record.id} onPress={() => navigation.navigate('SleepDetail', { recordId: record.id })} style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="bodyStrong">{t('sleep.sleptFor', { duration: formatDuration(record.durationMinutes) })}</AppText>
              <View
                style={{
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: theme.spacing.xxs,
                  borderRadius: theme.radius.pill,
                  backgroundColor: ratingColor(theme, record.rating),
                }}
              >
                <AppText variant="caption" color={theme.colors.text.onBrand}>
                  {t(`sleep.rating.${record.rating}`)}
                </AppText>
              </View>
            </View>
            <SleepStageBar stages={record.stages} />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
