import React, { useEffect, useState } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useKeepAwake } from 'expo-keep-awake';
import { Screen, AppText, Button, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { stressTechniques } from '../models/stressContent';
import { useCreateStressSessionMutation } from '../state/useStressQueries';
import { BreathingVisualizer } from '../../components/BreathingVisualizer';
import { ExerciseInstructions } from '../../components/ExerciseInstructions';
import { ExerciseTimer } from '../../components/ExerciseTimer';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import type { WellnessStackParamList, AppTabsParamList } from '../../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<WellnessStackParamList, 'StressActiveSession'>,
  BottomTabScreenProps<AppTabsParamList>
>;

type Phase = 'preparation' | 'active';
const PREP_SECONDS = 3;

/**
 * Structure: mirrors the generic Wellness `ActiveExerciseScreen`'s
 * preparation → active flow (prompt's Feature definition item 4: reuse
 * ExerciseTimer/BreathingVisualizer/ProgressIndicator/ExerciseInstructions,
 * Reanimated UI-thread animation, keep-awake, reduced-motion) — Figma frame
 * inaccessible, same fallback as the rest of this feature (see
 * ASSUMPTIONS.md). Unlike the generic screen, "completion" is its own
 * route (`StressCompletion`) rather than an in-place phase, so the
 * post-session mood check-in has a real screen to live on, and this screen
 * carries its own direct Safety affordance per the ≤2-tap rule (decision
 * recorded in ASSUMPTIONS.md Phase 10 after the Figma-vs-app audit).
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Button/
 * IconButton/EmptyState + the existing Wellness exercise components — no
 * values from Figma.
 */
export function StressActiveSessionScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const technique = stressTechniques.find((tech) => tech.id === route.params.techniqueId);
  const createSession = useCreateStressSessionMutation();

  const [phase, setPhase] = useState<Phase>('preparation');
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useKeepAwake('sakina-stress-session');

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    if (phase !== 'preparation') return;
    if (prepRemaining <= 0) {
      setPhase('active');
      return;
    }
    const timer = setTimeout(() => setPrepRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, prepRemaining]);

  useEffect(() => {
    if (phase !== 'active' || !technique || finishing) return;
    if (elapsed >= technique.durationSeconds) {
      finish();
      return;
    }
    const timer = setTimeout(() => setElapsed((s) => s + 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsed, technique, finishing]);

  async function finish() {
    if (!technique || finishing) return;
    setFinishing(true);
    try {
      const session = await createSession.mutateAsync({
        techniqueId: technique.id,
        durationSeconds: technique.durationSeconds,
      });
      navigation.replace('StressCompletion', { techniqueId: technique.id, sessionId: session.id });
    } catch {
      // Session persistence is a secondary side-effect (spec: no logging of
      // private content is required to be reliable) — never block the user
      // from reaching Completion because the mock write failed.
      navigation.replace('StressCompletion', { techniqueId: technique.id });
    }
  }

  if (!technique) {
    return (
      <Screen>
        <EmptyState title={t('wellness.notFound')} />
      </Screen>
    );
  }

  const remaining = Math.max(0, technique.durationSeconds - elapsed);
  const progress = technique.durationSeconds > 0 ? elapsed / technique.durationSeconds : 0;
  const currentStepIndex =
    technique.kind === 'guided' && technique.steps
      ? Math.min(technique.steps.length - 1, Math.floor((elapsed / technique.durationSeconds) * technique.steps.length))
      : 0;

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: theme.spacing.md }}>
          <Button
            label={t('stressManagement.safetyLinkCta')}
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          />
        </View>

        <View style={{ flex: 1, paddingTop: theme.spacing.md }}>
          {phase === 'preparation' ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
              <AppText variant="displayMd">{t('wellness.getReady')}</AppText>
              <AppText variant="displayLg">{prepRemaining}</AppText>
            </View>
          ) : (
            <View style={{ flex: 1, gap: theme.spacing.lg }}>
              <ProgressIndicator progress={progress} />

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {technique.kind === 'breathing' && technique.breathingPattern ? (
                  <BreathingVisualizer pattern={technique.breathingPattern} active reducedMotion={reducedMotion} />
                ) : technique.steps ? (
                  <ExerciseInstructions steps={technique.steps} currentStepIndex={currentStepIndex} />
                ) : null}
              </View>

              <ExerciseTimer remainingSeconds={remaining} />
              <Button label={t('wellness.finish')} variant="ghost" loading={finishing} onPress={finish} />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
