import React from 'react';
import { View, I18nManager } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../../../ui/theme';

export interface FanSegment {
  key: string;
  /** Relative weight (minutes / count / proportion — normalized internally). */
  value: number;
  color: string;
}

interface SleepStageChartProps {
  segments: FanSegment[];
  size?: number;
}

/** Bottom-centered polar point; angleDeg 0 = right, 90 = up (y grows downward). */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}

/**
 * The "Sleep Quality" fan — an upward half-disc split into wedges sized by
 * each stage/rating's proportion. Raw `react-native-svg` (no chart library;
 * same posture as MoodChart). Canvas space is LTR, so under RTL the segment
 * order is reversed to mirror the fan for an Arabic-reading eye — the same
 * technique MoodChart/Sparkline use.
 */
export function SleepStageChart({ segments, size = 260 }: SleepStageChartProps) {
  const theme = useTheme();
  const ordered = I18nManager.isRTL ? [...segments].reverse() : segments;
  const total = ordered.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  const cx = size / 2;
  const cy = size * 0.92;
  const rOuter = size * 0.82;

  if (total <= 0) {
    return (
      <View style={{ width: size, height: cy + 4 }}>
        <Svg width={size} height={cy + 4}>
          <Path
            d={describeWedge(cx, cy, rOuter, 180, 0)}
            fill={theme.colors.border.subtle}
          />
        </Svg>
      </View>
    );
  }

  // Sweep the upper semicircle from 180° (left) down to 0° (right).
  let angle = 180;
  const paths = ordered.map((seg) => {
    const span = (Math.max(0, seg.value) / total) * 180;
    const start = angle;
    const end = angle - span;
    angle = end;
    return { key: seg.key, d: describeWedge(cx, cy, rOuter, start, end), color: seg.color };
  });

  return (
    <View style={{ width: size, height: cy + 4 }}>
      <Svg width={size} height={cy + 4}>
        {paths.map((p) => (
          <Path key={p.key} d={p.d} fill={p.color} />
        ))}
      </Svg>
    </View>
  );

  function describeWedge(centerX: number, centerY: number, r: number, startDeg: number, endDeg: number) {
    const p1 = polar(centerX, centerY, r, startDeg);
    const p2 = polar(centerX, centerY, r, endDeg);
    // startDeg > endDeg (we sweep clockwise in screen space) → sweep-flag 1.
    return `M ${centerX} ${centerY} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`;
  }
}
