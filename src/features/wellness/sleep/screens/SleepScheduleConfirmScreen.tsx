import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useSleepFormat } from '../components/useSleepFormat';
import { useCreateSleepScheduleMutation } from '../state/useSleepQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepScheduleConfirm'>;

/**
 * "Confirm Schedule" — a read-back of the draft before persisting it. Create
 * writes the schedule (a real local preference) then replaces to the success
 * screen. Structure follows the SH Freud confirm frame; styling is 100%
 * Sakina tokens/primitives.
 */
export function SleepScheduleConfirmScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatTime } = useSleepFormat();
  const { draft } = route.params;
  const createSchedule = useCreateSleepScheduleMutation();

  const daysLabel =
    draft.activeDays.length === 7
      ? t('sleep.everyDay')
      : draft.activeDays.map((d) => t(`sleep.dayShort.${d}`)).join(t('sleep.dayJoin'));

  const create = async () => {
    try {
      const schedule = await createSchedule.mutateAsync(draft);
      navigation.replace('SleepScheduleCreated', { scheduleId: schedule.id });
    } catch {
      // Schedule persistence is a local convenience; never trap the user on
      // this screen if the mock write fails — still show the success state.
      navigation.replace('SleepScheduleCreated', {});
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.confirmTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('sleep.confirmSubtitle')}
        </AppText>

        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" color={theme.colors.accent.steps}>
            {daysLabel}
          </AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ gap: theme.spacing.xxs }}>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('sleep.bedtime')}
              </AppText>
              <AppText variant="titleMd">{formatTime(draft.bedtime)}</AppText>
            </View>
            <View style={{ gap: theme.spacing.xxs }}>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('sleep.wakeUp')}
              </AppText>
              <AppText variant="titleMd">{formatTime(draft.wakeTime)}</AppText>
            </View>
          </View>
          <Button label={t('sleep.editSchedule')} variant="ghost" size="md" onPress={() => navigation.goBack()} />
        </Card>

        <Card style={{ gap: theme.spacing.xs }}>
          <SummaryRow label={t('sleep.autoAlarm')} value={draft.autoAlarm} />
          <SummaryRow label={t('sleep.soundEffect')} value={draft.soundEnabled} />
          <SummaryRow label={t('sleep.snooze')} value={draft.snoozeEnabled} />
        </Card>

        <View style={{ marginTop: theme.spacing.md }}>
          <Button label={t('sleep.continue')} loading={createSchedule.isPending} onPress={create} />
        </View>
      </ScrollView>
    </Screen>
  );

  function SummaryRow({ label, value }: { label: string; value: boolean }) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value ? t('sleep.on') : t('sleep.off')}</AppText>
      </View>
    );
  }
}
