import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, EmptyState, useToast } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useSleepFormat } from '../components/useSleepFormat';
import { sleepSuggestions } from '../models/sleepContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepSuggestionDetail'>;

/**
 * The AI-suggestion detail ("Optimize Environment" style) — overview,
 * benefits, recommended bedtime, actionable steps, and a Mark-as-Resolved
 * action that confirms the score reward. Structure follows the SH Freud
 * suggestion-detail frame; styling is 100% Sakina tokens/primitives, and the
 * bilingual copy is content-catalog (isArabic ternary), per the codebase's
 * catalog convention (ASSUMPTIONS.md consistency pass).
 */
export function SleepSuggestionDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { formatTime } = useSleepFormat();
  const toast = useToast();

  const suggestion = sleepSuggestions.find((s) => s.id === route.params.suggestionId);

  if (!suggestion) {
    return (
      <Screen>
        <EmptyState title={t('sleep.notFound')} />
      </Screen>
    );
  }

  const benefits = isArabic ? suggestion.benefitsAr : suggestion.benefitsEn;
  const steps = isArabic ? suggestion.stepsAr : suggestion.stepsEn;

  const resolve = () => {
    toast.show({ message: t('sleep.suggestionResolved', { score: suggestion.scoreReward }), tone: 'success' });
    navigation.goBack();
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? suggestion.titleAr : suggestion.titleEn}</AppText>

        <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Metric value={t('sleep.minutesRange', { range: suggestion.minutesLabel })} label={t('sleep.minutesMetric')} />
          <Metric value={`+${suggestion.scoreReward}`} label={t('sleep.scoreMetric')} />
          <Metric value={String(suggestion.stepsAr.length)} label={t('sleep.tasksMetric')} />
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('sleep.overviewSectionTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {isArabic ? suggestion.summaryAr : suggestion.summaryEn}
          </AppText>
        </View>

        <Card style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('sleep.recommendedBedtime')}</AppText>
          <AppText variant="displayMd">{formatTime(suggestion.recommendedBedtime)}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('sleep.recommendedBedtimeHint')}
          </AppText>
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('sleep.benefits')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {benefits.map((benefit) => (
              <View key={benefit} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, width: '45%' }}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.status.success} />
                <AppText variant="body">{benefit}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('sleep.steps')}</AppText>
          {steps.map((step, index) => (
            <Card key={step} style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' }}>
              <AppText variant="titleMd" color={theme.colors.brand.primary}>
                {index + 1}
              </AppText>
              <AppText variant="body" style={{ flex: 1 }}>
                {step}
              </AppText>
            </Card>
          ))}
        </View>

        <Button label={t('sleep.markResolved')} onPress={resolve} />
      </ScrollView>
    </Screen>
  );

  function Metric({ value, label }: { value: string; label: string }) {
    return (
      <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
        <AppText variant="titleMd">{value}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {label}
        </AppText>
      </View>
    );
  }
}
