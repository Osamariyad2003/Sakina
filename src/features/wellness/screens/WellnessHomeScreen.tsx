import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AppText, Card, EmptyState, Screen, Tabs } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { wellnessCategories, wellnessExercises } from '../models/wellnessContent';
import { ExerciseCard } from '../components/ExerciseCard';
import { useBadgeSignalsQuery } from '../../badges/state/useBadgeQueries';
import type { WellnessCategory } from '../../../types/models';
import type { WellnessStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'WellnessHome'>;

export function WellnessHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const [category, setCategory] = useState<WellnessCategory>('breathing');
  const signalsQuery = useBadgeSignalsQuery();

  const exercises = wellnessExercises.filter((e) => e.category === category);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('wellness.title')}</AppText>

        {/* Feature 7 (Mindful Minutes) — reuses Badges' stat-card pattern (accent top-border + big number + caption). */}
        <Card style={{ borderTopWidth: 3, borderTopColor: theme.colors.accent.mindful }} elevation="md">
          <AppText variant="titleLg">{t('wellness.mindfulMinutesTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('wellness.mindfulMinutesValue', { count: signalsQuery.data?.mindfulMinutes ?? 0 })}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {signalsQuery.data && signalsQuery.data.mindfulStreak > 0
              ? t('wellness.mindfulStreakValue', { count: signalsQuery.data.mindfulStreak })
              : t('wellness.mindfulStreakEmpty')}
          </AppText>
        </Card>

        <Card onPress={() => navigation.navigate('StressOverview')} elevation="md">
          <AppText variant="titleMd">{t('wellness.stressManagementCardTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('wellness.stressManagementCardSubtitle')}
          </AppText>
        </Card>

        <Card
          onPress={() => navigation.navigate('HydrationHome')}
          elevation="md"
          style={{ borderTopWidth: 3, borderTopColor: theme.colors.accent.hydration }}
        >
          <AppText variant="titleMd">{t('wellness.hydrationCardTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('wellness.hydrationCardSubtitle')}
          </AppText>
        </Card>

        <Card
          onPress={() => navigation.navigate('SleepQuality')}
          elevation="md"
          style={{ borderTopWidth: 3, borderTopColor: theme.colors.accent.sleep }}
        >
          <AppText variant="titleMd">{t('wellness.sleepCardTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('wellness.sleepCardSubtitle')}
          </AppText>
        </Card>

        <Card
          onPress={() => navigation.navigate('WellnessResources')}
          elevation="md"
          style={{ borderTopWidth: 3, borderTopColor: theme.colors.accent.reflection }}
        >
          <AppText variant="titleMd">{t('resources.wellnessCardTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('resources.wellnessCardSubtitle')}
          </AppText>
        </Card>

        <Tabs
          items={wellnessCategories.map((c) => ({ key: c.key, label: isArabic ? c.labelAr : c.labelEn }))}
          value={category}
          onChange={(key) => setCategory(key as WellnessCategory)}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        {exercises.length === 0 ? (
          // Uses the shared EmptyState primitive for consistency with every
          // other list screen's empty case (Journal list, Mood history).
          // The looping Lottie is a hand-authored placeholder (see
          // ASSUMPTIONS.md) — EmptyState renders it via its existing `icon`
          // slot, no change to the primitive itself.
          <EmptyState
            title={t('wellness.comingSoonForCategory')}
            icon={<AnimatedLottie source={require('../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
          />
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onPress={() => navigation.navigate('ExerciseDetails', { exerciseId: exercise.id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
