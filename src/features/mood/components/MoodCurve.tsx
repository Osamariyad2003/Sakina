import React from 'react';
import { View, I18nManager } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../../ui/theme';

interface MoodCurveProps {
  /** 0-4, which of the five mood nodes is active. */
  selectedIndex: number;
  color: string;
  width?: number;
  height?: number;
}

/**
 * The decorative five-node mood curve under the selector. Nodes sit on a
 * gentle U so the active mood lifts as it improves; the selected node is
 * ringed. Node order reverses under RTL so "improving" reads toward the
 * correct edge — same technique as MoodChart/Sparkline.
 */
export function MoodCurve({ selectedIndex, color, width = 300, height = 72 }: MoodCurveProps) {
  const theme = useTheme();
  const count = 5;
  const pad = 16;
  const usableW = width - pad * 2;
  // U-shape: ends high, middle low (normalized 0=top .. 1=bottom of band).
  const bandTop = 12;
  const bandH = height - 28;
  const yFor = (i: number) => {
    const t = i / (count - 1); // 0..1
    const u = Math.abs(t - 0.5) * 2; // 1 at ends, 0 in middle
    return bandTop + (1 - u) * bandH; // middle lowest
  };
  const xFor = (i: number) => pad + (usableW * i) / (count - 1);

  const activeIndex = I18nManager.isRTL ? count - 1 - selectedIndex : selectedIndex;

  const linePath = Array.from({ length: count }, (_, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(i)}`).join(' ');

  return (
    <View>
      <Svg width={width} height={height}>
        <Path d={linePath} stroke={color} strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" fill="none" />
        {Array.from({ length: count }, (_, i) => {
          const active = i === activeIndex;
          return (
            <Circle
              key={i}
              cx={xFor(i)}
              cy={yFor(i)}
              r={active ? 9 : 6}
              fill={active ? theme.colors.background.surface : color}
              stroke={color}
              strokeWidth={active ? 4 : 0}
            />
          );
        })}
      </Svg>
    </View>
  );
}
