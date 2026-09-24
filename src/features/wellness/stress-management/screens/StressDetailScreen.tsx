import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, Badge, SkeletonList, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { triggerCatalog } from '../../../mood/models/moodContent';
import { stressLevelOptions } from '../models/stressContent';
import { useStressHistoryQuery, useDeleteStressEntryMutation } from '../state/useStressCheckInQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'StressDetail'>;

/** Mirrors MoodDetailScreen's structure (level + triggers + note + delete), plus a suggested-exercise link. */
export function StressDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const historyQuery = useStressHistoryQuery();
  const deleteEntry = useDeleteStressEntryMutation();

  if (historyQuery.isLoading) {
    return (
      <Screen>
        <SkeletonList rows={6} />
      </Screen>
    );
  }

  const entry = (historyQuery.data ?? []).find((e) => e.id === route.params.entryId);

  if (!entry) {
    return (
      <Screen>
        <EmptyState title={t('stressCheckIn.notFound')} />
      </Screen>
    );
  }

  const levelOption = stressLevelOptions.find((o) => o.level === entry.level);
  const levelColor =
    entry.level === 'high' ? theme.colors.status.error : entry.level === 'medium' ? theme.colors.status.warning : theme.colors.status.success;
  const triggers = entry.triggerIds
    .map((id) => triggerCatalog.find((t) => t.id === id))
    .filter((t): t is (typeof triggerCatalog)[number] => Boolean(t));

  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleString(isArabic ? 'ar-JO' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Suggested next action (Feature 2: link to a real Wellness exercise) — a high level or a
  // named trigger both warrant a coping technique; a quiet neutral/low entry doesn't need one.
  const suggestionId = entry.level === 'high' ? 'high-stress-relief' : triggers.length > 0 ? 'recurring-trigger' : null;

  const remove = async () => {
    try {
      await deleteEntry.mutateAsync(entry.id);
    } finally {
      navigation.goBack();
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('stressCheckIn.detailTitle')}</AppText>

        <Card style={{ alignItems: 'center', gap: theme.spacing.xs, backgroundColor: levelColor }}>
          <AppText variant="titleLg" color={theme.colors.text.onBrand}>
            {isArabic ? levelOption?.labelAr : levelOption?.labelEn}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand}>
            {dateLabel}
          </AppText>
        </Card>

        {triggers.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs }}>
            {triggers.map((trigger) => (
              <Badge key={trigger.id} label={isArabic ? trigger.labelAr : trigger.labelEn} />
            ))}
          </View>
        ) : null}

        {entry.note ? (
          <Card style={{ gap: theme.spacing.xxs }}>
            <AppText variant="titleMd">{t('stressCheckIn.noteQuestion')}</AppText>
            <AppText variant="editorial" color={theme.colors.text.secondary}>
              {entry.note}
            </AppText>
          </Card>
        ) : null}

        {suggestionId ? (
          <Card
            onPress={() => navigation.navigate('StressSuggestionDetail', { suggestionId })}
            style={{ backgroundColor: theme.colors.brand.primaryDark, gap: theme.spacing.xxs }}
          >
            <AppText variant="label" color={theme.colors.text.onBrand}>
              {t('stressCheckIn.suggestedNextStep')}
            </AppText>
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {t('stressCheckIn.openSuggestion')}
            </AppText>
          </Card>
        ) : null}

        <Button label={t('stressCheckIn.deleteFromHistory')} variant="destructive" loading={deleteEntry.isPending} onPress={remove} />
      </ScrollView>
    </Screen>
  );
}
