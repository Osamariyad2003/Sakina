import React, { useEffect, useState } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';

interface WaterFillGaugeProps {
  /** 0 to 1. */
  progress: number;
  width?: number;
  height?: number;
}

/**
 * The "animated water-fill viz tied to % of daily goal." A plain
 * Reanimated-driven fill (bottom-anchored, animates height) is the real,
 * data-bound visual — the same "data value + ambient Lottie glow" split
 * already used for `WellbeingReflectionCard`'s ring: `LottieView`'s
 * `progress` prop is native-only (its own web implementation warns it's
 * unsupported on web), so binding the actual percentage to Lottie would
 * silently break on the platform this session verifies against. The
 * looping `waterShimmer` asset behind it is decorative motion only.
 */
export function WaterFillGauge({ progress, width = 120, height = 160 }: WaterFillGaugeProps) {
  const theme = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const fill = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    const target = Math.max(0, Math.min(1, progress)) * 100;
    fill.value = reducedMotion ? target : withTiming(target, { duration: 700, easing: Easing.out(Easing.ease) });
  }, [progress, reducedMotion, fill]);

  const animatedStyle = useAnimatedStyle(() => ({ height: `${fill.value}%` }));

  return (
    <View
      style={{
        width,
        height,
        borderRadius: theme.radius.lg,
        borderWidth: 2,
        borderColor: theme.colors.border.default,
        backgroundColor: theme.colors.background.surface,
        overflow: 'hidden',
      }}
    >
      <AnimatedLottie
        source={require('../../../../../assets/lottie/waterShimmer.json')}
        style={{ position: 'absolute', width: width * 1.4, height: width * 1.4, top: height / 2 - (width * 1.4) / 2, left: -width * 0.2, opacity: 0.3 }}
      />
      <Animated.View
        style={[
          { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.accent.hydration, opacity: 0.85 },
          animatedStyle,
        ]}
      />
    </View>
  );
}
