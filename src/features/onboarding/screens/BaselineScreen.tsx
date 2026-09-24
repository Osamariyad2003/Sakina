import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Chip, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { ScaleSelector } from '../../mood/components/ScaleSelector';
import { baselineQuestions } from '../models/onboardingContent';
import { useOnboardingAnswersStore } from '../state/onboardingAnswersStore';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Baseline'>;

/**
 * The Mental Health Assessment step (Feature 1): single-select, multi-select
 * and scale questions in one flow, a non-color step indicator ("Step X of N"
 * text alongside the filled/unfilled bars — accessibility baseline: never
 * color alone), and a confirm-before-skip exit since some users won't want
 * to answer these questions immediately. Answers feed AssessmentSummary next.
 */
export function BaselineScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const baseline = useOnboardingAnswersStore((s) => s.baseline);
  const multiAnswers = useOnboardingAnswersStore((s) => s.multiAnswers);
  const scaleAnswers = useOnboardingAnswersStore((s) => s.scaleAnswers);
  const setBaselineAnswer = useOnboardingAnswersStore((s) => s.setBaselineAnswer);
  const toggleMultiAnswer = useOnboardingAnswersStore((s) => s.toggleMultiAnswer);
  const setScaleAnswer = useOnboardingAnswersStore((s) => s.setScaleAnswer);
  const [index, setIndex] = useState(0);

  const question = baselineQuestions[index];
  const isLast = index === baselineQuestions.length - 1;

  const isAnswered =
    question.kind === 'single'
      ? Boolean(baseline[question.id])
      : question.kind === 'scale'
        ? scaleAnswers[question.id] != null
        : true; // multi-select questions are always optional (spec: "Optional — pick more than one")

  const goNext = () => {
    if (isLast) {
      navigation.navigate('AssessmentSummary');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const confirmSkip = () => {
    Alert.alert(t('onboarding.skipAssessmentConfirmTitle'), t('onboarding.skipAssessmentConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.skip'), style: 'destructive', onPress: () => navigation.navigate('Consent') },
    ]);
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ gap: theme.spacing.xxs }}>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('onboarding.stepIndicator', { current: index + 1, total: baselineQuestions.length })}
          </AppText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xxs }}>
            {baselineQuestions.map((q, i) => (
              <View
                key={q.id}
                style={{
                  flex: 1,
                  height: theme.spacing.xxs,
                  borderRadius: theme.radius.pill,
                  backgroundColor: i <= index ? theme.colors.brand.primary : theme.colors.border.subtle,
                }}
              />
            ))}
          </View>
        </View>

        <AppText variant="displayMd">{isArabic ? question.promptAr : question.promptEn}</AppText>
        {question.kind === 'multi' && (question.hintAr || question.hintEn) ? (
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: -theme.spacing.sm }}>
            {isArabic ? question.hintAr : question.hintEn}
          </AppText>
        ) : null}

        {question.kind === 'scale' ? (
          <ScaleSelector
            value={scaleAnswers[question.id] ?? Math.round((question.min + question.max) / 2)}
            onChange={(v) => setScaleAnswer(question.id, v)}
            min={question.min}
            max={question.max}
            minLabel={isArabic ? question.minLabelAr : question.minLabelEn}
            maxLabel={isArabic ? question.maxLabelAr : question.maxLabelEn}
          />
        ) : (
          <View style={{ gap: theme.spacing.xs }}>
            {question.options.map((option) => (
              <Chip
                key={option.id}
                label={isArabic ? option.labelAr : option.labelEn}
                selected={
                  question.kind === 'multi'
                    ? (multiAnswers[question.id] ?? []).includes(option.id)
                    : baseline[question.id] === option.id
                }
                onPress={() =>
                  question.kind === 'multi'
                    ? toggleMultiAnswer(question.id, option.id)
                    : setBaselineAnswer(question.id, option.id)
                }
              />
            ))}
          </View>
        )}

        <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
          <Button label={isLast ? t('common.done') : t('common.next')} onPress={goNext} disabled={!isAnswered} />
          {index > 0 ? <Button label={t('common.back')} variant="ghost" onPress={() => setIndex((i) => i - 1)} /> : null}
          <Button label={t('onboarding.skipAssessmentCta')} variant="ghost" onPress={confirmSkip} />
        </View>
      </View>
    </Screen>
  );
}
