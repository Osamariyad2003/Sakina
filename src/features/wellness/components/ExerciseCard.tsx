import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { WellnessExerciseContent } from '../models/wellnessContent';

interface ExerciseCardProps {
  exercise: WellnessExerciseContent;
  onPress: () => void;
}

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const minutes = Math.round(exercise.durationSeconds / 60);

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <AppText variant="titleMd">{isArabic ? exercise.titleAr : exercise.titleEn}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }} numberOfLines={2}>
            {isArabic ? exercise.descriptionAr : exercise.descriptionEn}
          </AppText>
        </View>
        <Badge label={isArabic ? `${minutes} د` : `${minutes} min`} />
      </View>
    </Card>
  );
}
