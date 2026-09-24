import React from 'react';
import { View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

import { useClearMyDataMutation } from '../state/useProfileMutations';
import { AIPersonalizationCard } from '../../ai-companion/components/AIPersonalizationCard';
import { errorText } from '../../../core/errors';

/**
 * [ASSUMPTION] Data export/delete controls are flagged as undefined in
 * product-definition.md §11/Open Question #5 — this "clear my data" action
 * is a real local-only implementation (wipes the MMKV mock stores), not
 * a server-side delete on its own; with the real API on it is preceded by
 * profileService.clearServerData() (POST /profile/clear-data).
 */
export function PrivacyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const clearMyData = useClearMyDataMutation();

  const confirmClear = () => {
    Alert.alert(t('privacy.clearDataConfirmTitle'), t('privacy.clearDataConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('privacy.clearDataConfirmCta'),
        style: 'destructive',
        onPress: async () => {
          // Ordering (server → local → query cache) lives in the mutation.
          try {
            await clearMyData.mutateAsync();
          } catch (error) {
            toast.show({ message: errorText(error, t), tone: 'error' });
            return;
          }
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

        <AIPersonalizationCard />

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
