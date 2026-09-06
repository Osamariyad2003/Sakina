import React from 'react';
import { View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { clearAllLocalContentData } from '../../../core/storage/mmkv';

/**
 * [ASSUMPTION] Data export/delete controls are flagged as undefined in
 * product-definition.md §11/Open Question #5 — this "clear my data" action
 * is a real local-only implementation (wipes the MMKV mock stores), not
 * yet a server-side delete, since no backend exists.
 */
export function PrivacyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const confirmClear = () => {
    Alert.alert(t('privacy.clearDataConfirmTitle'), t('privacy.clearDataConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('privacy.clearDataConfirmCta'),
        style: 'destructive',
        onPress: () => {
          clearAllLocalContentData();
          toast.show({ message: t('privacy.clearDataSuccess'), tone: 'success' });
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('privacy.title')}</AppText>

        <Card>
          <AppText variant="titleMd">{t('privacy.consentStatusTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('privacy.consentStatusBody')}
          </AppText>
        </Card>

        <Card>
          <AppText variant="titleMd">{t('privacy.clearDataTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs, marginBottom: theme.spacing.sm }}>
            {t('privacy.clearDataBody')}
          </AppText>
          <Button label={t('privacy.clearDataButton')} variant="destructive" onPress={confirmClear} />
        </Card>
      </View>
    </Screen>
  );
}
