import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { stressTechniques } from '../models/stressContent';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'StressTechniqueDetail'>;

/**
 * Structure: mirrors the generic Wellness `ExerciseDetailsScreen` exactly
 * (prompt's Feature definition item 3 explicitly asks to reuse it) — Figma
 * frame inaccessible (see StressOverviewScreen's header comment /
 * ASSUMPTIONS.md), same fallback applies here.
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Button/
 * EmptyState — no values from Figma.
 */
export function StressTechniqueDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const technique = stressTechniques.find((tech) => tech.id === route.params.techniqueId);

  if (!technique) {
    return (
      <Screen>
        <EmptyState title={t('wellness.notFound')} />
      </Screen>
    );
  }

  const minutes = Math.round(technique.durationSeconds / 60);

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? technique.titleAr : technique.titleEn}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {isArabic ? technique.descriptionAr : technique.descriptionEn}
        </AppText>
        <AppText variant="label" color={theme.colors.text.secondary}>
          {t('wellness.durationLabel', { minutes })}
        </AppText>

        <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
          <Button
            label={t('wellness.startExercise')}
            onPress={() => navigation.navigate('StressActiveSession', { techniqueId: technique.id })}
          />
          <Button label={t('wellness.back')} variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </Screen>
  );
}
