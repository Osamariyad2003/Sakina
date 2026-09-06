import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Chip, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { onboardingGoals } from '../models/onboardingContent';
import { useOnboardingAnswersStore } from '../state/onboardingAnswersStore';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goals'>;

export function GoalsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const goalIds = useOnboardingAnswersStore((s) => s.goalIds);
  const toggleGoal = useOnboardingAnswersStore((s) => s.toggleGoal);
  const isArabic = i18n.language !== 'en';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('onboarding.goalsTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('onboarding.goalsSubtitle')}
        </AppText>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
          {onboardingGoals.map((goal) => (
            <Chip
              key={goal.id}
              label={isArabic ? goal.labelAr : goal.labelEn}
              selected={goalIds.includes(goal.id)}
              onPress={() => toggleGoal(goal.id)}
            />
          ))}
        </View>

        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
          <Button label={t('common.next')} onPress={() => navigation.navigate('Baseline')} />
          <Button label={t('common.skip')} variant="ghost" onPress={() => navigation.navigate('Baseline')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
