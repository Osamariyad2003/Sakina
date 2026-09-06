import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface SafetyBannerProps {
  onOpenSafety: () => void;
  onDismiss?: () => void;
}

/**
 * Pinned escalation banner — shown when risk language is detected in the AI
 * Companion (spec §16 Safety business rule). Never auto-dismisses on its
 * own; the user (or a screen change) closes it explicitly.
 */
export function SafetyBanner({ onOpenSafety, onDismiss }: SafetyBannerProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={{ backgroundColor: theme.colors.status.error, borderRadius: 0 }} elevation="none">
      <AppText variant="titleMd" color={theme.colors.text.onBrand}>
        {t('companion.riskBannerTitle')}
      </AppText>
      <AppText variant="body" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs, marginBottom: theme.spacing.sm }}>
        {t('companion.riskBannerBody')}
      </AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        <Button label={t('companion.riskBannerCta')} variant="secondary" onPress={onOpenSafety} />
        {onDismiss ? <Button label={t('common.cancel')} variant="secondary" onPress={onDismiss} /> : null}
      </View>
    </Card>
  );
}
