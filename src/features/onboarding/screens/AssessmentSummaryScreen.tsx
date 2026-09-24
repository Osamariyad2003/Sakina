import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useOnboardingAnswersStore } from '../state/onboardingAnswersStore';
import { useCreateMoodEntryMutation } from '../../mood/state/useMoodQueries';
import { wellnessCategories } from '../../wellness/models/wellnessContent';
import type { MoodLevel, WellnessCategory } from '../../../types/models';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AssessmentSummary'>;

const overallDaysToMood: Record<string, MoodLevel> = {
  hard: 'low',
  mixed: 'neutral',
  good: 'good',
  great: 'veryGood',
};

/** Deterministic, non-clinical: worse sleep beats stress beats energy — whichever signal is weakest gets the suggestion. */
function suggestCategory(sleepAnswer: string | undefined, stressScale: number | undefined, energyAnswer: string | undefined): WellnessCategory {
  if (sleepAnswer === 'poor') return 'sleep';
  if ((stressScale ?? 0) >= 4) return 'stressRelief';
  if (energyAnswer === 'often' || energyAnswer === 'always') return 'relaxation';
  return 'meditation';
}

/**
 * Results/summary screen (Feature 1's acceptance criteria: "feeds into
 * Home's initial state — e.g. seeds the first mood entry, suggests a
 * starting Wellness category"). Onboarding runs before auth in this app
 * (RootNavigator: Onboarding → Auth → AppTabs), so there's no Home screen
 * to navigate into yet — the suggestion is surfaced here as supportive
 * text instead, and the mood entry is seeded directly into the same local
 * mock store Home's Mood summary reads from, so it's already there the
 * first time the user reaches Home.
 */
export function AssessmentSummaryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const baseline = useOnboardingAnswersStore((s) => s.baseline);
  const scaleAnswers = useOnboardingAnswersStore((s) => s.scaleAnswers);
  const seeded = useRef(false);
  const seedMood = useCreateMoodEntryMutation();

  const moodLevel = baseline.overallDays ? overallDaysToMood[baseline.overallDays] : null;
  const suggestedCategory = useMemo(
    () => suggestCategory(baseline.sleepPatterns, scaleAnswers.stressLevelScale, baseline.energyFrequency),
    [baseline.sleepPatterns, baseline.energyFrequency, scaleAnswers.stressLevelScale],
  );
  const categoryLabel = wellnessCategories.find((c) => c.key === suggestedCategory);

  useEffect(() => {
    if (seeded.current || !moodLevel) return;
    seeded.current = true;
    // Best-effort: a failed seed shouldn't block onboarding from continuing.
    // Through the mutation so the mood caches are invalidated — seeding via the
    // service directly left Home showing "not logged yet" until a refetch.
    seedMood.mutate({ mood: moodLevel, emotionIds: [], triggerIds: [] });
  }, [moodLevel, seedMood]);

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={{ alignItems: 'center' }}>
          <AnimatedLottie
            source={require('../../../../assets/lottie/celebrate.json')}
            loop={false}
            style={{ width: 120, height: 120 }}
            fallback={<AppText variant="displayLg">🌿</AppText>}
          />
        </View>

        <AppText variant="displayMd">{t('onboarding.summaryTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('onboarding.summaryBody')}
        </AppText>

        {categoryLabel ? (
          <Card style={{ backgroundColor: theme.colors.brand.primaryDark, gap: theme.spacing.xxs }}>
            <AppText variant="label" color={theme.colors.text.onBrand}>
              {t('onboarding.summarySuggestionLabel')}
            </AppText>
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {isArabic ? categoryLabel.labelAr : categoryLabel.labelEn}
            </AppText>
          </Card>
        ) : null}

        {moodLevel ? (
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('onboarding.summaryMoodSeeded')}
          </AppText>
        ) : null}

        <View style={{ marginTop: 'auto', paddingBottom: theme.spacing.md }}>
          <Button label={t('common.continue')} onPress={() => navigation.navigate('Consent')} />
        </View>
      </View>
    </Screen>
  );
}
