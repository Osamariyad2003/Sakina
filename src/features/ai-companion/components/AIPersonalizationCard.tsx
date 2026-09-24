import React from 'react';
import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Card } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useAiPersonalization } from '../state/useAiPersonalization';

/**
 * The explicit opt-in for personalised replies. The copy says exactly what is
 * shared and what is not, so the switch is an informed choice.
 */
export function AIPersonalizationCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const enabled = useAiPersonalization((s) => s.enabled);
  const setEnabled = useAiPersonalization((s) => s.setEnabled);

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppText variant="titleMd">{t('companion.personalizeTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('companion.personalizeBody')}
          </AppText>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          accessibilityLabel={t('companion.personalizeTitle')}
          trackColor={{ false: theme.colors.border.default, true: theme.colors.brand.primary }}
        />
      </View>
    </Card>
  );
}
