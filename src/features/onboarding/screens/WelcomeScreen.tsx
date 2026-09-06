import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { AnimatedLottie } from '../../../ui/lottie';
import { useTheme } from '../../../ui/theme';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

/**
 * Structure: first-launch entry screen (mobile-engineering-spec.md screen
 * inventory — "Welcome") — a single hero moment with one CTA into the rest
 * of onboarding. The Figma reference file (SH Freud UI Kit v1.7) was
 * inaccessible to this pass (no editor permission — see ASSUMPTIONS.md), so
 * this structure comes from our own screen inventory instead, per the
 * task's fallback instruction.
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Button — no
 * values taken from Figma.
 */
export function WelcomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        {/* Hero calm animation. Drop a licensed iconscout Lottie over
            assets/lottie/welcomeHero.json to upgrade — reduced-motion callers
            fall back to no hero (text-only), matching the app-wide pattern. */}
        <AnimatedLottie
          source={require('../../../../assets/lottie/welcomeHero.json')}
          style={{ width: 180, height: 180 }}
        />
        <AppText variant="displayLg" style={{ textAlign: 'center' }}>
          {t('auth.welcomeTitle')}
        </AppText>
        <AppText
          variant="body"
          color={theme.colors.text.secondary}
          style={{ textAlign: 'center', paddingHorizontal: theme.spacing.lg }}
        >
          {t('auth.welcomeSubtitle')}
        </AppText>
        <Button label={t('auth.welcomeCta')} onPress={() => navigation.navigate('Language')} />
      </View>
    </Screen>
  );
}
