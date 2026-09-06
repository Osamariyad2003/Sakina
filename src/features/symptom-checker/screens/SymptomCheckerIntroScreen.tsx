import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useCheckerStore } from '../state/useCheckerStore';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'SymptomCheckerIntro'>;

/**
 * "AI Mental Illness Symptom Checker" intro. Structure follows the SH Freud
 * intro frame; styling is 100% Sakina tokens/primitives. Carries the
 * app-wide non-diagnostic framing from the first screen.
 */
export function SymptomCheckerIntroScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const reset = useCheckerStore((s) => s.reset);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AppText variant="displayLg">🧠</AppText>
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('checker.introTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('checker.introSubtitle')}
        </AppText>
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('checker.disclaimer')}
        </AppText>
      </View>
      <View style={{ paddingBottom: theme.spacing.md }}>
        <Button
          label={t('checker.getStarted')}
          onPress={() => {
            reset();
            navigation.navigate('SymptomCheckMethod');
          }}
        />
      </View>
    </Screen>
  );
}
