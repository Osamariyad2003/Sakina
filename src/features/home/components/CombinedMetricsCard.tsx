import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useCombinedMetrics } from '../state/useCombinedMetrics';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';

type Navigation = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<AppTabsParamList>
>['navigation'];

/**
 * Feature 6 — a single glanceable row correlating Mood, Sleep and Stress,
 * additive below the existing per-metric carousel (Mood/Stress/Sleep
 * summary cards) rather than replacing it. Each tile is tappable straight
 * into that tracker's own history, so this card never needs its own detail
 * screen.
 */
export function CombinedMetricsCard({ navigation }: { navigation: Navigation }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  // One application-layer read instead of four cross-feature hooks here.
  const { mood, stress, averageSleepHours: avgSleepHours, sleepStress } = useCombinedMetrics();

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <AppText variant="titleMd">{t('home.combinedMetricsTitle')}</AppText>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <Tile
          onPress={() => navigation.navigate('MoodTab', { screen: 'MoodHome' })}
          accent={theme.colors.accent.mood}
          label={t('home.combinedMoodLabel')}
          value={mood ? mood.emoji : '—'}
          caption={mood ? (isArabic ? mood.labelAr : mood.labelEn) : t('home.combinedNoDataYet')}
        />
        <Tile
          onPress={() => navigation.navigate('WellnessTab', { screen: 'SleepQuality' })}
          accent={theme.colors.accent.sleep}
          label={t('home.combinedSleepLabel')}
          value={avgSleepHours != null ? t('home.combinedSleepHours', { hours: avgSleepHours.toFixed(1) }) : '—'}
          caption={t('home.combinedSleepCaption')}
        />
        <Tile
          onPress={() => navigation.navigate('WellnessTab', { screen: 'StressHistory' })}
          accent={theme.colors.accent.stress}
          label={t('home.combinedStressLabel')}
          value={stress ? (isArabic ? stress.labelAr : stress.labelEn) : '—'}
          caption={stress ? '' : t('home.combinedNoDataYet')}
        />
      </View>
      {sleepStress.stressHigherAfterShortSleep ? (
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('home.combinedCorrelationSleepStress')}
        </AppText>
      ) : null}
    </Card>
  );
}

function Tile({
  onPress,
  accent,
  label,
  value,
  caption,
}: {
  onPress: () => void;
  accent: string;
  label: string;
  value: string;
  caption: string;
}) {
  const theme = useTheme();
  return (
    <Card onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: theme.spacing.xxs, borderTopWidth: 3, borderTopColor: accent }}>
      <AppText variant="caption" color={theme.colors.text.secondary}>
        {label}
      </AppText>
      <AppText variant="titleMd">{value}</AppText>
      {caption ? (
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {caption}
        </AppText>
      ) : null}
    </Card>
  );
}
