import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useKeepAwake } from 'expo-keep-awake';
import { Screen, AppText, Button } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import { useSleepFormat } from '../components/useSleepFormat';
import { useCreateSleepRecordMutation } from '../state/useSleepQueries';
import { toClock } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepSession'>;

/**
 * The sleep session — "Start Sleeping" → a Good Night state that keeps the
 * screen awake and counts elapsed time → "Wake Up" writes the night as a
 * record and hands off to the summary. Presented as a full-screen modal.
 * Structure follows the SH Freud start/sleep/wake frames; styling is 100%
 * Sakina tokens/primitives. Duration is the real elapsed session time (a
 * genuine measure, not a simulated full night — see sleepContent.ts header).
 */
export function SleepSessionScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatDuration } = useSleepFormat();
  const createRecord = useCreateSleepRecordMutation();

  // Kept awake for the whole modal — this screen exists only to run a session.
  useKeepAwake('sakina-sleep-session');

  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (startedAt == null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const elapsedMinutes = startedAt == null ? 0 : Math.max(0, Math.floor((now - startedAt) / 60000));

  const wake = async () => {
    if (startedAt == null) return;
    const durationMinutes = Math.max(1, elapsedMinutes);
    const bedtime = toClock(minutesOfDay(new Date(startedAt)));
    const wakeTime = toClock(minutesOfDay(new Date()));
    try {
      const record = await createRecord.mutateAsync({ durationMinutes, bedtime, wakeTime });
      navigation.replace('SleepSummary', { recordId: record.id });
    } catch {
      navigation.replace('SleepSummary', {});
    }
  };

  const isSleeping = startedAt != null;

  return (
    <Screen style={{ backgroundColor: theme.colors.brand.primaryDark }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AnimatedLottie
          source={require('../../../../../assets/lottie/sleepMoon.json')}
          style={{ width: 160, height: 160 }}
          fallback={
            <AppText variant="displayLg" color={theme.colors.text.onBrand}>
              🌙
            </AppText>
          }
        />
        {isSleeping ? (
          <>
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {t('sleep.goodNight')}
            </AppText>
            <AppText variant="displayLg" color={theme.colors.text.onBrand}>
              {formatDuration(elapsedMinutes)}
            </AppText>
            <AppText variant="caption" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
              {t('sleep.sleepingHint')}
            </AppText>
          </>
        ) : (
          <AppText variant="displayMd" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
            {t('sleep.startSleepingTitle')}
          </AppText>
        )}
      </View>

      <View style={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.md }}>
        {isSleeping ? (
          <Button label={t('sleep.wakeUp')} loading={createRecord.isPending} onPress={wake} />
        ) : (
          <>
            <Button
              label={t('sleep.startSleeping')}
              onPress={() => {
                const t0 = Date.now();
                setStartedAt(t0);
                setNow(t0);
              }}
            />
            <Button label={t('sleep.cancel')} variant="ghost" onPress={() => navigation.goBack()} />
          </>
        )}
      </View>
    </Screen>
  );
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}
