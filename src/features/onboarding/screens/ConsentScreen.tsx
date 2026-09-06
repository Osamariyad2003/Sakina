import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useOnboardingStore } from '../state/onboardingStore';

/**
 * Consent gates all Mood/Journal/AI data storage (product-definition.md §6/§11,
 * business rules). [ASSUMPTION] Actual legal consent copy isn't specified —
 * this is placeholder text with a real functional gate (explicit toggle
 * required before continuing); replace the copy with reviewed legal text
 * before ship.
 */
export function ConsentScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const markComplete = useOnboardingStore((s) => s.markComplete);
  const [agreed, setAgreed] = useState(false);

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('onboarding.consentTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('onboarding.consentBody')}
        </AppText>

        <Button
          label={agreed ? `✓ ${t('onboarding.consentAgree')}` : t('onboarding.consentAgree')}
          variant={agreed ? 'primary' : 'secondary'}
          onPress={() => setAgreed((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
        />

        <View style={{ marginTop: 'auto' }}>
          <Button label={t('onboarding.consentCta')} onPress={markComplete} disabled={!agreed} />
        </View>
      </View>
    </Screen>
  );
}
