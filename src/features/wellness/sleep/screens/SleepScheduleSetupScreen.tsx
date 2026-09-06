import React from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, IconButton } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useSleepFormat } from '../components/useSleepFormat';
import {
  defaultSleepGoalMinutes,
  parseClock,
  toClock,
  scheduleDurationMinutes,
  splitDuration,
} from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepScheduleSetup'>;

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon…Sun (display order)

/**
 * "Set Your Schedule" + "Alarm Options" combined: active days, bedtime &
 * wake time, and alarm toggles. Times are adjusted with ±15-min steppers
 * (accessible touch targets) rather than a clock dial. Prefilled from the
 * goal or from the AI recommendation. Structure follows the SH Freud
 * schedule/alarm frames; styling is 100% Sakina tokens/primitives.
 */
export function SleepScheduleSetupScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatTime, formatDuration } = useSleepFormat();

  const goalMinutes = route.params?.goalMinutes ?? defaultSleepGoalMinutes;
  const [wakeTime, setWakeTime] = React.useState(route.params?.wakeTime ?? '06:00');
  const [bedtime, setBedtime] = React.useState(
    route.params?.bedtime ?? toClock(parseClock('06:00') - goalMinutes),
  );
  const [activeDays, setActiveDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [autoAlarm, setAutoAlarm] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [snoozeEnabled, setSnoozeEnabled] = React.useState(false);

  const duration = scheduleDurationMinutes(bedtime, wakeTime);
  const { hours } = splitDuration(goalMinutes);
  const goalLabel = formatDuration(goalMinutes);

  const toggleDay = (day: number) =>
    setActiveDays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort()));

  const shift = (clock: string, delta: number, set: (c: string) => void) => () =>
    set(toClock(parseClock(clock) + delta));

  const TimeRow = ({
    label,
    value,
    onDec,
    onInc,
  }: {
    label: string;
    value: string;
    onDec: () => void;
    onInc: () => void;
  }) => (
    <Card style={{ gap: theme.spacing.xs }}>
      <AppText variant="label" color={theme.colors.text.secondary}>
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          accessibilityLabel={t('sleep.decrement')}
          icon={<Ionicons name="remove" size={22} color={theme.colors.brand.primary} />}
          onPress={onDec}
        />
        <AppText variant="titleLg">{formatTime(value)}</AppText>
        <IconButton
          accessibilityLabel={t('sleep.increment')}
          icon={<Ionicons name="add" size={22} color={theme.colors.brand.primary} />}
          onPress={onInc}
        />
      </View>
    </Card>
  );

  const ToggleRow = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <AppText variant="body">{label}</AppText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.colors.brand.primary, false: theme.colors.border.default }}
        thumbColor={theme.colors.background.surface}
      />
    </View>
  );

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.scheduleTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('sleep.scheduleGoalHint', { goal: goalLabel, hours })}
        </AppText>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('sleep.activeDays')}</AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {WEEKDAY_ORDER.map((day) => {
              const on = activeDays.includes(day);
              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => toggleDay(day)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? theme.colors.brand.primary : theme.colors.background.surface,
                    borderWidth: 1,
                    borderColor: on ? theme.colors.brand.primary : theme.colors.border.default,
                  }}
                >
                  <AppText variant="label" color={on ? theme.colors.text.onBrand : theme.colors.text.primary}>
                    {t(`sleep.dayShort.${day}`)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TimeRow
          label={t('sleep.bedtime')}
          value={bedtime}
          onDec={shift(bedtime, -15, setBedtime)}
          onInc={shift(bedtime, 15, setBedtime)}
        />
        <TimeRow
          label={t('sleep.wakeUp')}
          value={wakeTime}
          onDec={shift(wakeTime, -15, setWakeTime)}
          onInc={shift(wakeTime, 15, setWakeTime)}
        />

        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('sleep.scheduledDuration', { duration: formatDuration(duration) })}
        </AppText>

        <Card style={{ gap: theme.spacing.sm }}>
          <AppText variant="titleMd">{t('sleep.alarmOptions')}</AppText>
          <ToggleRow label={t('sleep.autoAlarm')} value={autoAlarm} onValueChange={setAutoAlarm} />
          <ToggleRow label={t('sleep.soundEffect')} value={soundEnabled} onValueChange={setSoundEnabled} />
          <ToggleRow label={t('sleep.snooze')} value={snoozeEnabled} onValueChange={setSnoozeEnabled} />
        </Card>

        <Button
          label={t('sleep.continue')}
          disabled={activeDays.length === 0}
          onPress={() =>
            navigation.navigate('SleepScheduleConfirm', {
              draft: { bedtime, wakeTime, activeDays, goalMinutes, autoAlarm, soundEnabled, snoozeEnabled },
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}
