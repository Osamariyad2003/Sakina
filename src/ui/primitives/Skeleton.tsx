import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AccessibilityInfo } from 'react-native';
import { useTheme } from '../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: object;
}

/** Shimmering placeholder block — never show a blank screen while loading (spec §25). */
export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      opacity.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    });
    return () => {
      cancelled = true;
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.border.subtle,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Stack of Skeleton rows — for list screens (Mood history, Journal, Professionals). */
export function SkeletonList({ rows = 4, rowHeight = 64 }: { rows?: number; rowHeight?: number }) {
  const theme = useTheme();
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={rowHeight} radius={theme.radius.lg} style={{ marginBottom: theme.spacing.sm }} />
      ))}
    </>
  );
}
