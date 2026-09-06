import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Chip, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { baselineQuestions } from '../models/onboardingContent';
import { useOnboardingAnswersStore } from '../state/onboardingAnswersStore';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Baseline'>;

export function BaselineScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const baseline = useOnboardingAnswersStore((s) => s.baseline);
  const setBaselineAnswer = useOnboardingAnswersStore((s) => s.setBaselineAnswer);
  const [index, setIndex] = useState(0);

  const question = baselineQuestions[index];
  const isLast = index === baselineQuestions.length - 1;
  const currentAnswer = baseline[question.id];

  const goNext = () => {
    if (isLast) {
      navigation.navigate('Consent');
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
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

        <AppText variant="displayMd">{isArabic ? question.promptAr : question.promptEn}</AppText>

        <View style={{ gap: theme.spacing.xs }}>
          {question.options.map((option) => (
            <Chip
              key={option.id}
              label={isArabic ? option.labelAr : option.labelEn}
              selected={currentAnswer === option.id}
              onPress={() => setBaselineAnswer(question.id, option.id)}
            />
          ))}
        </View>

        <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
          <Button label={isLast ? t('common.done') : t('common.next')} onPress={goNext} disabled={!currentAnswer} />
          {index > 0 ? <Button label={t('common.back')} variant="ghost" onPress={() => setIndex((i) => i - 1)} /> : null}
        </View>
      </View>
    </Screen>
  );
}
