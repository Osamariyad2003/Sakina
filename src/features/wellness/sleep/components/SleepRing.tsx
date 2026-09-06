import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../../ui/theme';

interface SleepRingProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Progress-arc color; defaults to the sleep accent. */
  color?: string;
  trackColor?: string;
  /** Rendered centered inside the ring (e.g. a value + label). */
  children?: React.ReactNode;
}

/**
 * Circular progress ring — the shared radial viz behind the score dial, the
 * Sleep-overview REM/Core rings, and the AI recommendation. Plain
 * `react-native-svg` (spec §15 / same approach as MoodChart/Sparkline), so
 * no chart library is introduced. The arc starts at 12 o'clock; direction is
 * purely decorative (a proportion, not a left-to-right sequence) so it needs
 * no RTL flip.
 */
export function SleepRing({ progress, size = 160, strokeWidth = 14, color, trackColor, children }: SleepRingProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor ?? theme.colors.border.subtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color ?? theme.colors.accent.sleep}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
}
