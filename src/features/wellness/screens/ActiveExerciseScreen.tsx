import React, { useEffect, useRef, useState } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useKeepAwake } from 'expo-keep-awake';
import { Screen, AppText, Button, EmptyState, ContentImage } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { wellnessExercises } from '../models/wellnessContent';
import { useContentImage } from '../state/useContentImages';
import { BreathingVisualizer } from '../components/BreathingVisualizer';
import { ExerciseInstructions } from '../components/ExerciseInstructions';
import { ExerciseTimer } from '../components/ExerciseTimer';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { CompletionState } from '../components/CompletionState';
import { useCreateWellnessSessionMutation } from '../state/useWellnessSessionMutations';
import type { WellnessStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'ActiveExercise'>;

type Phase = 'preparation' | 'active' | 'completion';
const PREP_SECONDS = 3;

/** Exercise Details → Preparation → Exercise → Progress → Completion (spec §18), all within this one continuous screen. */
export function ActiveExerciseScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const exercise = wellnessExercises.find((e) => e.id === route.params.exerciseId);
  const createSession = useCreateWellnessSessionMutation();
  const curatedImage = useContentImage('wellness_exercise', route.params.exerciseId);

  const [phase, setPhase] = useState<Phase>('preparation');
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [runToken, setRunToken] = useState(0); // bump to restart a fresh run (repeat)

  // Keep the screen awake through preparation + active (spec §18).
  useKeepAwake('sakina-wellness-exercise');

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    setPhase('preparation');
    setPrepRemaining(PREP_SECONDS);
    setElapsed(0);
  }, [runToken]);

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
    if (phase !== 'active' || !exercise) return;
    if (elapsed >= exercise.durationSeconds) {
      setPhase('completion');
      return;
    }
    const timer = setTimeout(() => setElapsed((s) => s + 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, elapsed, exercise]);

  // Feature 7 (Mindful Minutes): record the session as soon as this run reaches
  // completion — whether by the timer running out or the user tapping "Finish"
  // early. Keyed by `runToken` so a "Repeat" logs a second, separate session
  // instead of re-firing for the same run. Best-effort: a failed write
  // shouldn't block the user from seeing their completion screen.
  const loggedRunToken = useRef<number | null>(null);
  const createSessionMutate = createSession.mutate;
  useEffect(() => {
    if (phase !== 'completion' || !exercise) return;
    if (loggedRunToken.current === runToken) return;
    loggedRunToken.current = runToken;
    createSessionMutate({ exerciseId: exercise.id, category: exercise.category, durationSeconds: Math.min(elapsed, exercise.durationSeconds) });
  }, [phase, runToken, exercise, elapsed, createSessionMutate]);

  if (!exercise) {
    return (
      <Screen>
        <EmptyState title={t('wellness.notFound')} />
      </Screen>
    );
  }

  const remaining = Math.max(0, exercise.durationSeconds - elapsed);
  const progress = exercise.durationSeconds > 0 ? elapsed / exercise.durationSeconds : 0;
  const currentStepIndex =
    exercise.kind === 'guided' && exercise.steps
      ? Math.min(
          exercise.steps.length - 1,
          Math.floor((elapsed / exercise.durationSeconds) * exercise.steps.length),
        )
      : 0;

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg }}>
        {/* Stays put across preparation/active/completion so the screen doesn't
            reflow under the user mid-exercise. Kept short in the active phase:
            the visualizer, not the photo, is what they're following. */}
        {curatedImage ?? exercise.image ? (
          <ContentImage
            image={curatedImage ?? exercise.image}
            height={phase === 'active' ? 120 : 200}
            style={{ marginBottom: theme.spacing.md }}
          />
        ) : null}
        {phase === 'preparation' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
            <AppText variant="displayMd">{t('wellness.getReady')}</AppText>
            <AppText variant="displayLg">{prepRemaining}</AppText>
          </View>
        ) : phase === 'active' ? (
          <View style={{ flex: 1, gap: theme.spacing.lg }}>
            <ProgressIndicator progress={progress} />

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {exercise.kind === 'breathing' && exercise.breathingPattern ? (
                <BreathingVisualizer pattern={exercise.breathingPattern} active reducedMotion={reducedMotion} />
              ) : exercise.steps ? (
                <ExerciseInstructions steps={exercise.steps} currentStepIndex={currentStepIndex} />
              ) : null}
            </View>

            <ExerciseTimer remainingSeconds={remaining} />
            <Button label={t('wellness.finish')} variant="ghost" onPress={() => setPhase('completion')} />
          </View>
        ) : (
          <CompletionState onRepeat={() => setRunToken((t) => t + 1)} onDone={() => navigation.popToTop()} />
        )}
      </View>
    </Screen>
  );
}
