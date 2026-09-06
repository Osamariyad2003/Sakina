import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useCheckerStore } from '../state/useCheckerStore';
import { symptomsFromEmotion } from '../models/checkerContent';
import { useAnalyzeMutation } from '../state/useCheckerQueries';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'SymptomAnalyzing'>;

/**
 * "Analyzing Data…" — runs the deterministic mock analysis over the collected
 * inputs, then replaces to the results. Combines manual symptoms with any
 * chatbot physical symptoms; all free text is passed for risk scanning.
 * Structure follows the SH Freud analyzing frame; styling is 100% Sakina
 * tokens/primitives.
 */
export function SymptomAnalyzingScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const store = useCheckerStore();
  const analyze = useAnalyzeMutation();
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const symptomIds = Array.from(
      new Set([...store.symptomIds, ...store.physicalSymptomIds, ...symptomsFromEmotion(store.emotionId)]),
    );
    const freeText = [store.moodDescription, store.reasonText, store.selfHarmText].filter(Boolean).join(' ');
    analyze.mutate(
      { method: store.method, symptomIds, freeText },
      {
        onSuccess: (result) => navigation.replace('SymptomResults', { sessionId: result.sessionId }),
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen style={{ backgroundColor: theme.colors.brand.primaryDark }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AnimatedLottie
          source={require('../../../../assets/lottie/aiThinking.json')}
          style={{ width: 140, height: 140 }}
          fallback={<ActivityIndicator size="large" color={theme.colors.text.onBrand} />}
        />
        <AppText variant="displayMd" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
          {t('checker.analyzingTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
          {t('checker.analyzingBody')}
        </AppText>

        {analyze.isError ? (
          <Button label={t('checker.retry')} variant="secondary" onPress={() => { startedRef.current = false; navigation.replace('SymptomAnalyzing'); }} />
        ) : null}
      </View>
    </Screen>
  );
}
