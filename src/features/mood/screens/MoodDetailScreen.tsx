import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, Badge, SkeletonList, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodColor } from '../components/moodColors';
import { useMoodHistoryQuery, useDeleteMoodEntryMutation } from '../state/useMoodQueries';
import { moodLevels, companionCatalog } from '../models/moodContent';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodDetail'>;

/**
 * Mood detail — mood + companions, a supportive "Nth time in a row" line,
 * the self-reported stats, the note, the typed check-in place, and delete.
 * Structure follows the SH Freud detail frame; styling is 100% Sakina
 * tokens/primitives. Reads from history so it can compute the same-mood run.
 */
export function MoodDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const historyQuery = useMoodHistoryQuery();
  const deleteEntry = useDeleteMoodEntryMutation();

  if (historyQuery.isLoading) {
    return (
      <Screen>
        <SkeletonList rows={6} />
      </Screen>
    );
  }

  const entries = historyQuery.data ?? [];
  const index = entries.findIndex((e) => e.id === route.params.entryId);
  const entry = index >= 0 ? entries[index] : undefined;

  if (!entry) {
    return (
      <Screen>
        <EmptyState title={t('mood.notFound')} />
      </Screen>
    );
  }

  const option = moodLevels.find((m) => m.level === entry.mood)!;
  // How many consecutive most-recent entries (from this one onward) share the mood.
  let runLength = 1;
  for (let i = index + 1; i < entries.length; i++) {
    if (entries[i].mood === entry.mood) runLength += 1;
    else break;
  }

  // Guard: entries created before this feature landed have no companionIds.
  const companions = (entry.companionIds ?? [])
    .map((id) => companionCatalog.find((c) => c.id === id))
    .filter((c): c is (typeof companionCatalog)[number] => Boolean(c));

  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleString(isArabic ? 'ar-JO' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sleepLabel = entry.metrics?.sleepQuality ? t(`mood.sleep${cap(entry.metrics.sleepQuality)}`) : t('common.skip');

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
        <AppText variant="displayMd">{t('mood.detailTitle')}</AppText>

        <Card style={{ alignItems: 'center', gap: theme.spacing.xs, backgroundColor: moodColor(theme, entry.mood) }}>
          <AppText style={{ fontSize: 56 }}>{option.emoji}</AppText>
          <AppText variant="titleLg" color={theme.colors.text.onBrand}>
            {t('mood.imFeeling', { mood: isArabic ? option.labelAr : option.labelEn })}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand}>
            {dateLabel}
          </AppText>
          {runLength > 1 ? (
            <AppText variant="caption" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
              {t('mood.inARow', { count: runLength, mood: isArabic ? option.labelAr : option.labelEn })}
            </AppText>
          ) : null}
        </Card>

        {companions.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs }}>
            {companions.map((c) => (
              <Badge key={c.id} label={isArabic ? c.labelAr : c.labelEn} />
            ))}
          </View>
        ) : null}

        {entry.metrics ? (
          <Card style={{ gap: theme.spacing.sm }}>
            <AppText variant="titleMd">{t('mood.additionalStats')}</AppText>
            <StatRow label={t('mood.sleepCondition')} value={sleepLabel} />
            {entry.metrics.stress != null ? <StatRow label={t('mood.stressLevel')} value={`${entry.metrics.stress}/10`} /> : null}
            {entry.metrics.active != null ? <StatRow label={t('mood.activeLevel')} value={`${entry.metrics.active}/10`} /> : null}
            {entry.metrics.eat != null ? <StatRow label={t('mood.eatLevel')} value={`${entry.metrics.eat}/10`} /> : null}
          </Card>
        ) : null}

        {entry.note ? (
          <Card style={{ gap: theme.spacing.xxs }}>
            <AppText variant="titleMd">{t('mood.additionalNotes')}</AppText>
            <AppText variant="editorial" color={theme.colors.text.secondary}>
              {entry.note}
            </AppText>
          </Card>
        ) : null}

        {entry.locationLabel ? (
          <Card style={{ gap: theme.spacing.xxs }}>
            <AppText variant="titleMd">{t('mood.checkInLocation')}</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
              <Ionicons name="location-outline" size={18} color={theme.colors.brand.primary} />
              <AppText variant="body">{entry.locationLabel}</AppText>
            </View>
          </Card>
        ) : null}

        <Button label={t('mood.deleteFromHistory')} variant="destructive" loading={deleteEntry.isPending} onPress={remove} />
      </ScrollView>
    </Screen>
  );

  function StatRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {label}
        </AppText>
        <AppText variant="bodyStrong">{value}</AppText>
      </View>
    );
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
