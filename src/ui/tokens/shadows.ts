import { Platform } from 'react-native';
import type { ColorScheme } from './colors';

export interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Elevation scale, defined per-platform (spec §8: iOS shadow*, Android elevation).
 * Kept very soft — this is a calm app, not a card-heavy dashboard.
 */
export function buildShadows(scheme: ColorScheme) {
  const shadowColor = scheme === 'light' ? '#292D2B' : '#000000';

  const level = (elevation: number, opacity: number, radius: number, offsetY: number): ShadowStyle =>
    Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: { elevation },
      default: {},
    }) as ShadowStyle;

  return {
    none: {} as ShadowStyle,
    sm: level(2, 0.06, 4, 1),
    md: level(4, 0.08, 8, 2),
    lg: level(8, 0.1, 16, 4),
  };
}

export type Shadows = ReturnType<typeof buildShadows>;
