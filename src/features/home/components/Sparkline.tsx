import React from 'react';
import { View, I18nManager } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
}

/**
 * Minimal trend line for tracker rows — same raw `react-native-svg`
 * approach as `mood/components/MoodChart.tsx` (no chart library adopted
 * yet; see ASSUMPTIONS.md), RTL-aware via reversing point order under
 * `I18nManager.isRTL`, same technique already used there.
 */
export function Sparkline({ points, width = 64, height = 24 }: SparklineProps) {
  const theme = useTheme();
  const ordered = I18nManager.isRTL ? [...points].reverse() : points;
  const max = Math.max(1, ...ordered);
  const stepX = ordered.length > 1 ? width / (ordered.length - 1) : width;
  const coords = ordered.map((v, i) => `${i * stepX},${height - (v / max) * height}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        <Polyline
          points={coords}
          fill="none"
          stroke={theme.colors.brand.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
