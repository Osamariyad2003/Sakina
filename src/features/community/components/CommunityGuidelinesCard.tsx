import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { communityGuidelines } from '../models/communityContent';

/** The five rules, shown on the Community home and above every composer. */
export function CommunityGuidelinesCard() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  return (
    <Card style={{ gap: theme.spacing.xs }}>
      <AppText variant="titleMd">{t('community.guidelinesTitle')}</AppText>
      {communityGuidelines.map((guideline) => (
        <View key={guideline.id} style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'flex-start' }}>
          <Ionicons
            name={guideline.id === 'crisis' ? 'shield-outline' : 'checkmark-circle-outline'}
            size={16}
            color={guideline.id === 'crisis' ? theme.colors.status.error : theme.colors.brand.primary}
            style={{ marginTop: 3 }}
          />
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ flex: 1 }}>
            {isArabic ? guideline.textAr : guideline.textEn}
          </AppText>
        </View>
      ))}
    </Card>
  );
}
