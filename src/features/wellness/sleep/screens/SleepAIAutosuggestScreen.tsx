import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, Chip, LoadingState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import { SleepRing } from '../components/SleepRing';
import { useSleepFormat } from '../components/useSleepFormat';
import { useSleepRecommendationMutation } from '../state/useSleepQueries';
import { autosuggestQuestions } from '../models/sleepContent';
import type { SleepRecommendation } from '../services/sleepService';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepAIAutosuggest'>;

/**
 * "AI Autosuggest Sleep" — a tiny questionnaire, a compiling state, then a
 * recommendation (optimal vs minimal), which seeds the schedule setup.
 * Structure follows the SH Freud autosuggest frames; styling is 100% Sakina
 * tokens/primitives, and the recommendation math lives in sleepService.
 */
export function SleepAIAutosuggestScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { formatDuration, formatTime } = useSleepFormat();
  const recommend = useSleepRecommendationMutation();

  const [answers, setAnswers] = React.useState<Record<'wakeUp' | 'inBed', string>>({
    wakeUp: '06:00',
    inBed: '23:00',
  });
  const [result, setResult] = React.useState<SleepRecommendation | null>(null);

  const submit = async () => {
    try {
      const rec = await recommend.mutateAsync(answers);
      setResult(rec);
    } catch {
      // Keep the user in the flow — fall back to their own stated answers.
      setResult({
        optimalMinutes: 8 * 60,
        minimalMinutes: 6 * 60 + 12,
        bedtime: answers.inBed,
        wakeTime: answers.wakeUp,
      });
    }
  };

  if (recommend.isPending) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
          <AnimatedLottie
            source={require('../../../../../assets/lottie/aiThinking.json')}
            style={{ width: 140, height: 140 }}
            fallback={<LoadingState message={t('sleep.compiling')} />}
          />
          <AppText variant="titleMd">{t('sleep.compiling')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('sleep.compilingBody')}
          </AppText>
        </View>
      </Screen>
    );
  }

  if (result) {
    const optimalRatio = result.optimalMinutes / (result.optimalMinutes + result.minimalMinutes);
    return (
      <Screen edges={['top']} padded={false}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
          <AppText variant="displayMd">{t('sleep.recommendationTitle')}</AppText>

          <View style={{ alignItems: 'center' }}>
            <SleepRing progress={optimalRatio} size={200} strokeWidth={18} color={theme.colors.accent.steps}>
              <View style={{ alignItems: 'center' }}>
                <AppText variant="displayLg">{formatDuration(result.optimalMinutes)}</AppText>
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {t('sleep.minimalNeeded', { duration: formatDuration(result.minimalMinutes) })}
                </AppText>
              </View>
            </SleepRing>
          </View>

          <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ gap: theme.spacing.xxs }}>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('sleep.bedtime')}
              </AppText>
              <AppText variant="titleMd">{formatTime(result.bedtime)}</AppText>
            </View>
            <View style={{ gap: theme.spacing.xxs }}>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('sleep.wakeUp')}
              </AppText>
              <AppText variant="titleMd">{formatTime(result.wakeTime)}</AppText>
            </View>
          </Card>

          <Button
            label={t('sleep.continue')}
            onPress={() =>
              navigation.navigate('SleepScheduleSetup', {
                goalMinutes: result.optimalMinutes,
                bedtime: result.bedtime,
                wakeTime: result.wakeTime,
              })
            }
          />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.lg }}>
        <AppText variant="displayMd">{t('sleep.autosuggestTitle')}</AppText>

        {autosuggestQuestions.map((q) => (
          <View key={q.id} style={{ gap: theme.spacing.sm }}>
            <AppText variant="titleMd">{isArabic ? q.labelAr : q.labelEn}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {q.options.map((option) => (
                <Chip
                  key={option}
                  label={formatTime(option)}
                  selected={answers[q.id] === option}
                  onPress={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                />
              ))}
            </View>
          </View>
        ))}

        <Button label={t('sleep.continue')} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}
