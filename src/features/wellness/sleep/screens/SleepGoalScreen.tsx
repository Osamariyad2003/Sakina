import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, IconButton } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { defaultSleepGoalMinutes, splitDuration } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepGoal'>;

/**
 * "Set Your Sleep Goal" (hours + minutes). Uses accessible stepper controls
 * rather than a scroll wheel so the value is announced/adjustable via
 * standard touch targets; carries the chosen goal forward to schedule setup.
 * Structure follows the SH Freud goal/duration frames; styling is 100%
 * Sakina tokens/primitives.
 */
export function SleepGoalScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const initial = splitDuration(defaultSleepGoalMinutes);
  const [hours, setHours] = React.useState(initial.hours);
  const [minutes, setMinutes] = React.useState(initial.minutes);

  const clampHours = (v: number) => Math.max(3, Math.min(12, v));
  const stepMinutes = (v: number) => ((v % 60) + 60) % 60;

  const Stepper = ({
    value,
    label,
    onDec,
    onInc,
  }: {
    value: number;
    label: string;
    onDec: () => void;
    onInc: () => void;
  }) => (
    <Card style={{ flex: 1, alignItems: 'center', gap: theme.spacing.sm }}>
      <IconButton
        accessibilityLabel={t('sleep.increment')}
        icon={<Ionicons name="chevron-up" size={22} color={theme.colors.brand.primary} />}
        onPress={onInc}
      />
      <AppText variant="displayLg">{String(value).padStart(2, '0')}</AppText>
      <AppText variant="label" color={theme.colors.text.secondary}>
        {label}
      </AppText>
      <IconButton
        accessibilityLabel={t('sleep.decrement')}
        icon={<Ionicons name="chevron-down" size={22} color={theme.colors.brand.primary} />}
        onPress={onDec}
      />
    </Card>
  );

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.goalTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('sleep.goalSubtitle')}
        </AppText>

        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
          <Stepper
            value={hours}
            label={t('sleep.hours')}
            onInc={() => setHours((h) => clampHours(h + 1))}
            onDec={() => setHours((h) => clampHours(h - 1))}
          />
          <Stepper
            value={minutes}
            label={t('sleep.minutes')}
            onInc={() => setMinutes((m) => stepMinutes(m + 15))}
            onDec={() => setMinutes((m) => stepMinutes(m - 15))}
          />
        </View>

        <View style={{ marginTop: 'auto' }}>
          <Button
            label={t('sleep.setScheduleCta')}
            onPress={() =>
              navigation.navigate('SleepScheduleSetup', { goalMinutes: hours * 60 + minutes })
            }
          />
        </View>
      </View>
    </Screen>
  );
}
