import React from 'react';
import { View, I18nManager } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';
import { AppText } from '../../../ui/primitives';
import type { TrendPoint } from '../services/moodService';

interface MoodChartProps {
  points: TrendPoint[];
  height?: number;
  /** Ceiling of the value being charted — 5 for Mood's 5-level scale, 3 for Stress's low/medium/high. */
  maxValue?: number;
}

/**
 * Simple bar chart (react-native-svg per spec §15). Axis order flips for
 * RTL. Generic over any `{date, averageWeight}` trend (Mood's 1-5 weights,
 * Stress's 1-3 weights) — reused by StressHistoryScreen and the Home
 * summary cards rather than duplicating the charting approach.
 */
export function MoodChart({ points, height = 140, maxValue = 5 }: MoodChartProps) {
  const theme = useTheme();
  const width = Math.max(points.length * 28, 200);
  const barWidth = 14;
  const maxWeight = maxValue;

  // Canvas coordinate space is always LTR; reverse the data order under RTL
  // so "most recent" reads on the correct side for an Arabic-reading eye.
  const orderedPoints = I18nManager.isRTL ? [...points].reverse() : points;

  return (
    <View>
      <Svg width={width} height={height}>
        <Line x1={0} y1={height - 20} x2={width} y2={height - 20} stroke={theme.colors.border.subtle} strokeWidth={1} />
        {orderedPoints.map((point, index) => {
          const x = index * 28 + 7;
          const barHeight = point.averageWeight ? (point.averageWeight / maxWeight) * (height - 30) : 2;
          const y = height - 20 - barHeight;
          return (
            <Rect
              key={point.date}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={point.averageWeight ? theme.colors.brand.primary : theme.colors.border.subtle}
            />
          );
        })}
      </Svg>
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
        {orderedPoints[0]?.date} — {orderedPoints[orderedPoints.length - 1]?.date}
      </AppText>
    </View>
  );
}
