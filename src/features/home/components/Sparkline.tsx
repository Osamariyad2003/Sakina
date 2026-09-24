import React, { useState } from 'react';
import { I18nManager, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';

interface SparklineProps {
  points: number[];
  /** Fixed width. Omit to stretch across whatever space the row leaves. */
  width?: number;
  height?: number;
}

const MIN_WIDTH = 48;

/**
 * Minimal trend line for tracker rows — same raw `react-native-svg`
 * approach as `mood/components/MoodChart.tsx` (no chart library adopted
 * yet; see ASSUMPTIONS.md), RTL-aware via reversing point order under
 * `I18nManager.isRTL`, same technique already used there.
 *
 * With no explicit `width` it measures itself and fills the row, so a
 * tracker row reads as one full-width band on a phone and on a tablet/web
 * layout alike instead of leaving a gap in the middle.
 */
export function Sparkline({ points, width, height = 24 }: SparklineProps) {
  const theme = useTheme();
  const [measured, setMeasured] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.width);
    if (next !== measured) setMeasured(next);
  };

  const drawWidth = width ?? Math.max(MIN_WIDTH, measured);
  const ordered = I18nManager.isRTL ? [...points].reverse() : points;
  const max = Math.max(1, ...ordered);
  const stepX = ordered.length > 1 ? drawWidth / (ordered.length - 1) : drawWidth;
  const coords = ordered.map((v, i) => `${i * stepX},${height - (v / max) * height}`).join(' ');

  return (
    <View
      onLayout={width === undefined ? onLayout : undefined}
      style={width === undefined ? { flex: 1, minWidth: MIN_WIDTH, height } : undefined}
    >
      {/* Before the first layout pass there is nothing to draw against. */}
      {drawWidth > 0 ? (
        <Svg width={drawWidth} height={height}>
          <Polyline
            points={coords}
            fill="none"
            stroke={theme.colors.brand.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
