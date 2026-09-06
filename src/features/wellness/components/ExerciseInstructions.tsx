import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface ExerciseInstructionsProps {
  steps: { textAr: string; textEn: string }[];
  currentStepIndex: number;
}

export function ExerciseInstructions({ steps, currentStepIndex }: ExerciseInstructionsProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const step = steps[currentStepIndex];

  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg }}>
      <AppText variant="caption" color={theme.colors.text.secondary}>
        {currentStepIndex + 1} / {steps.length}
      </AppText>
      <AppText variant="displayMd" style={{ textAlign: 'center' }}>
        {isArabic ? step.textAr : step.textEn}
      </AppText>
    </View>
  );
}
