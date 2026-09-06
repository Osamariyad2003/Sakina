import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepScheduleCreated'>;

/**
 * "Sleep schedule created!" success state. Structure follows the SH Freud
 * confirmation frame; styling is 100% Sakina tokens/primitives.
 */
export function SleepScheduleCreatedScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AnimatedLottie
          source={require('../../../../../assets/lottie/celebrate.json')}
          loop={false}
          style={{ width: 140, height: 140 }}
          fallback={<AppText variant="displayLg">🌙</AppText>}
        />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('sleep.createdTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('sleep.createdBody')}
        </AppText>
      </View>
      <View style={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.md }}>
        <Button label={t('sleep.seeSchedule')} onPress={() => navigation.replace('MySleepSchedule')} />
        <Button label={t('sleep.done')} variant="ghost" onPress={() => navigation.navigate('SleepQuality')} />
      </View>
    </Screen>
  );
}
