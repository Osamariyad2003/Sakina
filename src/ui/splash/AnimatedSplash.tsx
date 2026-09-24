import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { AppText } from '../primitives';

interface AnimatedSplashProps {
  /** Flip to true once fonts are loaded and the session-restore check resolves. */
  ready: boolean;
  /** Called once the exit animation has fully finished — parent unmounts this then. */
  onExitComplete: () => void;
}

const MIN_VISIBLE_MS = 900;

/**
 * Custom JS splash shown immediately after the native splash image is
 * dismissed (expo-splash-screen only supports a static image — no
 * animation). Reuses the same "breathing halo" motif as the Wellness
 * BreathingVisualizer so the brand's calm identity is consistent from the
 * very first frame. Respects reduced-motion (no looping pulse, no
 * slide-in — just opacity fades).
 */
export function AnimatedSplash({ ready, onExitComplete }: AnimatedSplashProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedAt = useRef(Date.now());

  const overlayOpacity = useSharedValue(1);
  const contentScale = useSharedValue(0.92);
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(12);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  // Entrance + idle breathing loop.
  useEffect(() => {
    contentScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    wordmarkOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    wordmarkTranslateY.value = withDelay(250, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    taglineOpacity.value = withDelay(550, withTiming(1, { duration: 450 }));

    if (!reducedMotion) {
      ring1.value = withDelay(
        150,
        withRepeat(
          withSequence(
            withTiming(1.35, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );
      ring2.value = withDelay(
        450,
        withRepeat(
          withSequence(
            withTiming(1.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Exit once `ready`, but never show the splash for less than MIN_VISIBLE_MS
  // (avoids an unpleasant flash if data resolves instantly).
  useEffect(() => {
    if (!ready) return;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const timer = setTimeout(() => {
      contentScale.value = withTiming(1.04, { duration: 420, easing: Easing.in(Easing.cubic) });
      overlayOpacity.value = withTiming(0, { duration: 420, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onExitComplete)();
      });
    }, wait);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ transform: [{ scale: contentScale.value }] }));
  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ring1.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2.value }] }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: theme.colors.background.primary, pointerEvents: ready ? 'none' : 'auto' },
        overlayStyle,
      ]}
    >
      <View style={styles.center}>
        <Animated.View style={[styles.haloWrap, contentStyle]}>
          <Animated.View
            style={[styles.ring, { backgroundColor: theme.colors.brand.accentSoft, opacity: 0.35 }, ring2Style]}
          />
          <Animated.View
            style={[styles.ring, { backgroundColor: theme.colors.brand.accentSoft, opacity: 0.55 }, ring1Style]}
          />
          <View style={[styles.core, { backgroundColor: theme.colors.brand.primary }]} />
        </Animated.View>

        <Animated.View style={wordmarkStyle}>
          <AppText variant="displayLg" style={{ textAlign: 'center', marginTop: theme.spacing.lg }}>
            {t('auth.welcomeTitle')}
          </AppText>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center', marginTop: theme.spacing.xxs }}>
            {t('splash.tagline')}
          </AppText>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const RING_SIZE = 96;
const CORE_SIZE = 40;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  haloWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
  },
});
