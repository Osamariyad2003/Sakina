import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { BreathingPattern } from '../models/wellnessContent';

interface BreathingVisualizerProps {
  pattern: BreathingPattern;
  active: boolean;
  reducedMotion: boolean;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const phaseLabels: Record<Phase, { ar: string; en: string }> = {
  inhale: { ar: 'شهيق', en: 'Breathe in' },
  hold: { ar: 'ثبّت', en: 'Hold' },
  exhale: { ar: 'زفير', en: 'Breathe out' },
};

/**
 * The circle's pulse runs entirely on the UI thread via Reanimated 3
 * (withRepeat/withSequence/withTiming) — never a JS setInterval driving the
 * animation itself (spec §18). A lightweight JS interval separately tracks
 * which phase we're in only to update the text label underneath; it does
 * not drive any animated value.
 */
export function BreathingVisualizer({ pattern, active, reducedMotion }: BreathingVisualizerProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const scale = useSharedValue(1);
  const [phase, setPhase] = useState<Phase>('inhale');

  const cycleMs = (pattern.inhaleSeconds + pattern.holdSeconds + pattern.exhaleSeconds) * 1000;

  useEffect(() => {
    if (!active) {
      scale.value = withTiming(1, { duration: 300 });
      return;
    }

    if (reducedMotion) {
      scale.value = 1;
    } else {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: pattern.inhaleSeconds * 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.4, { duration: pattern.holdSeconds * 1000 }),
          withTiming(1, { duration: pattern.exhaleSeconds * 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) % cycleMs;
      if (elapsed < pattern.inhaleSeconds * 1000) setPhase('inhale');
      else if (elapsed < (pattern.inhaleSeconds + pattern.holdSeconds) * 1000) setPhase('hold');
      else setPhase('exhale');
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
      <View style={{ width: 180, height: 180, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: theme.colors.brand.accentSoft,
            },
            animatedStyle,
          ]}
        />
      </View>
      <AppText variant="titleLg">
        {active ? (isArabic ? phaseLabels[phase].ar : phaseLabels[phase].en) : isArabic ? 'جاهز' : 'Ready'}
      </AppText>
    </View>
  );
}
