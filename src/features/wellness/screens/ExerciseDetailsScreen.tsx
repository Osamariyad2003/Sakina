import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, EmptyState, ContentImage } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { wellnessExercises } from '../models/wellnessContent';
import { useContentImage } from '../state/useContentImages';
import type { WellnessStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'ExerciseDetails'>;

export function ExerciseDetailsScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const exercise = wellnessExercises.find((e) => e.id === route.params.exerciseId);
  const curatedImage = useContentImage('wellness_exercise', route.params.exerciseId);

  if (!exercise) {
    return (
      <Screen>
        <EmptyState title={t('wellness.notFound')} />
      </Screen>
    );
  }

  const minutes = Math.round(exercise.durationSeconds / 60);

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        {curatedImage ?? exercise.image ? (
          <ContentImage image={curatedImage ?? exercise.image} height={180} />
        ) : null}
        <AppText variant="displayMd">{isArabic ? exercise.titleAr : exercise.titleEn}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {isArabic ? exercise.descriptionAr : exercise.descriptionEn}
        </AppText>
        <AppText variant="label" color={theme.colors.text.secondary}>
          {t('wellness.durationLabel', { minutes })}
        </AppText>

        <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
          <Button
            label={t('wellness.startExercise')}
            onPress={() => navigation.navigate('ActiveExercise', { exerciseId: exercise.id })}
          />
          <Button label={t('wellness.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </Screen>
  );
}
