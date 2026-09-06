import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'CheckerSessionComplete'>;

/**
 * "Session Completed" — the close of a checker run. Structure follows the SH
 * Freud completion frame; styling is 100% Sakina tokens/primitives.
 */
export function CheckerSessionCompleteScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AnimatedLottie
          source={require('../../../../assets/lottie/celebrate.json')}
          loop={false}
          style={{ width: 140, height: 140 }}
          fallback={<AppText variant="displayLg">🌿</AppText>}
        />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('checker.sessionCompleteTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('checker.sessionCompleteBody')}
        </AppText>
      </View>
      <View style={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.md }}>
        <Button label={t('checker.greatThanks')} onPress={() => navigation.popToTop()} />
        <Button label={t('checker.repeatSession')} variant="secondary" onPress={() => navigation.navigate('SymptomCheckMethod')} />
        <Button label={t('checker.seeSessionHistory')} variant="ghost" onPress={() => navigation.navigate('CheckerSessionHistory')} />
      </View>
    </Screen>
  );
}
