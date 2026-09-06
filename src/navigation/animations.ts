import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { motion } from '../ui/tokens/motion';

/**
 * Shared navigation transitions (spec §31 — calm, subtle motion). These run on
 * the native thread via react-native-screens, so they stay smooth and respect
 * the device layout direction (RTL slides mirror automatically via I18nManager).
 *
 * Durations reference the motion tokens rather than hardcoding per-stack.
 */

/**
 * Default push transition for a stack: a gentle horizontal slide. Applied at the
 * navigator level so every pushed screen inherits it; individual screens can
 * still override (e.g. modals below).
 */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  animationDuration: motion.duration.base,
  gestureEnabled: true,
};

/**
 * Bottom-sheet style transition for screens presented modally. Pair with
 * `presentation: 'modal'` for the platform sheet, or use standalone for a
 * slide-up on Android.
 */
export const modalScreenOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: motion.duration.base,
};

/**
 * Full-screen takeover (active exercises, breathing sessions, analyzing states):
 * a soft fade-up that feels less abrupt than a hard cut for immersive screens.
 */
export const fullScreenModalOptions: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
  animation: 'fade_from_bottom',
  animationDuration: motion.duration.slow,
};

/**
 * Cross-fade for a transient/interstitial screen (e.g. analyzing spinners) where
 * a directional slide would feel jarring.
 */
export const fadeScreenOptions: NativeStackNavigationOptions = {
  animation: 'fade',
  animationDuration: motion.duration.base,
};

/**
 * Tab-switch transition for the bottom tabs. `shift` gives a subtle cross-fade +
 * lateral shift between tabs instead of an instant swap.
 */
export const tabScreenOptions: Pick<BottomTabNavigationOptions, 'animation'> = {
  animation: 'shift',
};
