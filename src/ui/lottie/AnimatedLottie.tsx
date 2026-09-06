import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { AccessibilityInfo, type ViewStyle } from 'react-native';
import LottieView, { type AnimationObject } from 'lottie-react-native';

interface AnimatedLottieProps {
  /** e.g. `require('../../../assets/lottie/reflectionRing.json')`. */
  source: AnimationObject;
  loop?: boolean;
  autoPlay?: boolean;
  /**
   * A plain style object (not an array/registered style id) — reused
   * as-is for `lottie-react-native`'s web-only `webStyle` prop too, since
   * `style` itself is native-only there (`@platform ios, android, windows`
   * per its own type doc) and is silently ignored on web otherwise.
   */
  style?: ViewStyle;
  /** Rendered instead of the animation when reduced-motion is on, or if the asset fails to load. */
  fallback?: React.ReactNode;
}

/**
 * Thin cross-platform wrapper around `lottie-react-native`'s `LottieView`
 * (which ships its own web implementation via `@lottiefiles/dotlottie-react`
 * — Metro resolves the right one per platform automatically, no separate
 * web package needed). Always falls back to `fallback` — a plain static or
 * Reanimated element the caller already has — when `AccessibilityInfo
 * .isReduceMotionEnabled()` is true, or if the animation fails to load.
 */
export function AnimatedLottie({ source, loop = true, autoPlay = true, style, fallback = null }: AnimatedLottieProps) {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  // Brief "not yet measured" beat avoids a flash of the wrong variant.
  if (reducedMotion === null) return null;
  if (reducedMotion || failed) return <>{fallback}</>;

  return (
    <LottieView
      source={source}
      loop={loop}
      autoPlay={autoPlay}
      style={style}
      webStyle={style as CSSProperties}
      onAnimationFailure={() => setFailed(true)}
    />
  );
}
