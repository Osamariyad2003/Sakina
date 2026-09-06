import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, EmptyState, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodSuggestions } from '../models/moodContent';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodSuggestionDetail'>;

/**
 * "Better Mood Management" — the AI mood-suggestion detail: metrics, overview,
 * a supportive tip, suggested tasks, benefits, a suggested check-in interval,
 * and Mark-as-Resolved (confirms the score reward). Structure follows the SH
 * Freud suggestion-detail frame; styling is 100% Sakina tokens/primitives;
 * bilingual copy is content-catalog (isArabic ternary).
 */
export function MoodSuggestionDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();

  const suggestion = moodSuggestions.find((s) => s.id === route.params.suggestionId);
  if (!suggestion) {
    return (
      <Screen>
        <EmptyState title={t('mood.suggestionNotFound')} />
      </Screen>
    );
  }

  const tasks = isArabic ? suggestion.tasksAr : suggestion.tasksEn;
  const benefits = isArabic ? suggestion.benefitsAr : suggestion.benefitsEn;

  const resolve = () => {
    toast.show({ message: t('mood.suggestionResolved', { score: suggestion.scoreReward }), tone: 'success' });
    navigation.goBack();
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? suggestion.titleAr : suggestion.titleEn}</AppText>

        <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <Metric value={suggestion.minutesLabel} label={t('mood.minutesMetric')} />
          <Metric value={`+${suggestion.scoreReward}`} label={t('mood.scoreMetric')} />
          <Metric value={String(suggestion.tasksAr.length)} label={t('mood.tasksMetric')} />
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('mood.overviewSectionTitle')}</AppText>
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

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('mood.suggestedTasks')}</AppText>
          {tasks.map((task, index) => (
            <Card key={task} style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
              <AppText variant="titleMd" color={theme.colors.brand.primary}>
                {index + 1}
              </AppText>
              <AppText variant="body" style={{ flex: 1 }}>
                {task}
              </AppText>
            </Card>
          ))}
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('mood.benefits')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {benefits.map((benefit) => (
              <View key={benefit} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, width: '45%' }}>
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.status.success} />
                <AppText variant="body">{benefit}</AppText>
              </View>
            ))}
          </View>
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText variant="displayMd" color={theme.colors.brand.primary}>
            {t('mood.checkInsPerDay', { count: suggestion.checkInsPerDay })}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ flex: 1 }}>
            {t('mood.suggestedIntervalBody', { count: suggestion.checkInsPerDay })}
          </AppText>
        </Card>

        <Button label={t('mood.markResolved')} onPress={resolve} />
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
