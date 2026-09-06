import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, Card, Chip } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { stressTechniques } from '../models/stressContent';
import { useCreateMoodEntryMutation } from '../../../mood/state/useMoodQueries';
import { moodLevels } from '../../../mood/models/moodContent';
import type { MoodLevel } from '../../../../types/models';
import type { WellnessStackParamList, AppTabsParamList } from '../../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<WellnessStackParamList, 'StressCompletion'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Structure: prompt's Feature definition item 5 — supportive close, an
 * OPTIONAL mood check-in that writes to the Mood module (the feature's key
 * cross-module link, via the existing `useCreateMoodEntryMutation` rather
 * than a new stress-specific write path), and next-step suggestions
 * (practice again / Journal / Safety — surfaced more directly if the
 * chosen mood is very low, per the business rule against "treating"
 * severe stress ourselves). Figma frame inaccessible — same fallback as
 * the rest of this feature (see ASSUMPTIONS.md).
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Button/Card/
 * Chip — no values from Figma.
 */
export function StressCompletionScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const technique = stressTechniques.find((tech) => tech.id === route.params.techniqueId);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const createMoodEntry = useCreateMoodEntryMutation();

  const selectMood = (level: MoodLevel) => {
    setSelectedMood(level);
    createMoodEntry.mutate({ mood: level, emotionIds: [], triggerIds: [] });
  };

  const showHighStressNudge = selectedMood === 'veryLow';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('wellness.completionTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('wellness.completionBody')}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('stressManagement.moodCheckInPrompt')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.xs }}>
            {moodLevels.map((option) => (
              <Chip
                key={option.level}
                label={`${option.emoji} ${isArabic ? option.labelAr : option.labelEn}`}
                selected={selectedMood === option.level}
                onPress={() => selectMood(option.level)}
              />
            ))}
          </View>
        </View>

        {showHighStressNudge ? (
          <Card style={{ backgroundColor: theme.colors.status.error }}>
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {t('stressManagement.highStressNudgeTitle')}
            </AppText>
            <AppText variant="body" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs, marginBottom: theme.spacing.sm }}>
              {t('stressManagement.highStressNudgeBody')}
            </AppText>
            <Button
              label={t('stressManagement.safetyLinkCta')}
              variant="secondary"
              onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
            />
          </Card>
        ) : null}

        <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
          {technique ? (
            <Button
              label={t('wellness.repeat')}
              variant="secondary"
              onPress={() => navigation.replace('StressActiveSession', { techniqueId: technique.id })}
            />
          ) : null}
          <Button label={t('stressManagement.openJournalCta')} variant="ghost" onPress={() => navigation.navigate('JournalTab')} />
          <Button label={t('common.done')} onPress={() => navigation.navigate('StressOverview')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
