import React from 'react';
import { View, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { emergencyResources } from '../models/resources';

/**
 * Always reachable within ≤2 taps (spec §21/§30/business rules). Uses
 * `Linking` with `tel:` — never a form or extra confirmation step in between.
 */
export function SafetyScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const call = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('safety.title')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('safety.subtitle')}
        </AppText>

        {emergencyResources.map((resource) => (
          <Card key={resource.id}>
            <AppText variant="titleMd">{isArabic ? resource.titleAr : resource.titleEn}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs, marginBottom: theme.spacing.sm }}>
              {isArabic ? resource.descriptionAr : resource.descriptionEn}
            </AppText>
            <Button label={t('safety.callCta', { number: resource.phoneNumber })} onPress={() => call(resource.phoneNumber)} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
