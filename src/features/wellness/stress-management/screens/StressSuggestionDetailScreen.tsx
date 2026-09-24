import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { stressSuggestions } from '../models/stressContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'StressSuggestionDetail'>;

/**
 * Mirrors MoodSuggestionDetailScreen's structure (title, overview, tip,
 * CTA), but its CTA is a *real* exercise: `techniqueId` points at an entry
 * in `stressTechniques`, so "Try this exercise" opens the actual guided
 * flow (StressTechniqueDetail → StressActiveSession) instead of staying
 * purely informational — the "suggested next action" Feature 2 asks for.
 */
export function StressSuggestionDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const suggestion = stressSuggestions.find((s) => s.id === route.params.suggestionId);
  if (!suggestion) {
    return (
      <Screen>
        <EmptyState title={t('stressCheckIn.suggestionNotFound')} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? suggestion.titleAr : suggestion.titleEn}</AppText>

        <Card style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
            <AppText variant="titleMd">{suggestion.minutesLabel}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('stressCheckIn.minutesMetric')}
            </AppText>
          </View>
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('stressCheckIn.overviewSectionTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {isArabic ? suggestion.summaryAr : suggestion.summaryEn}
          </AppText>
        </View>

        <Card style={{ flexDirection: 'row', gap: theme.spacing.sm, backgroundColor: theme.colors.brand.accent }}>
          <Ionicons name="bulb-outline" size={20} color={theme.colors.text.onBrand} />
          <AppText variant="body" color={theme.colors.text.onBrand} style={{ flex: 1 }}>
            {isArabic ? suggestion.tipAr : suggestion.tipEn}
          </AppText>
        </Card>

        <Button
          label={t('stressCheckIn.suggestionCta')}
          onPress={() => navigation.navigate('StressTechniqueDetail', { techniqueId: suggestion.techniqueId })}
        />
      </ScrollView>
    </Screen>
  );
}
