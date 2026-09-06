import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../../ui/theme';
import { stageColor } from './sleepColors';
import { sleepStages, totalStageMinutes, type SleepStageBreakdown } from '../models/sleepContent';

interface SleepStageBarProps {
  stages: SleepStageBreakdown;
  height?: number;
}

/**
 * Horizontal stacked proportion bar of the four sleep stages — the compact
 * viz used on history rows and the summary. Logical stage order stays
 * constant; React Native flips the row automatically under RTL, so the bar
 * reads from the start edge in both directions with no manual reversal.
 */
export function SleepStageBar({ stages, height = 10 }: SleepStageBarProps) {
  const theme = useTheme();
  const total = totalStageMinutes(stages);

  return (
    <View
      style={{
        flexDirection: 'row',
        height,
        borderRadius: theme.radius.pill,
        overflow: 'hidden',
        backgroundColor: theme.colors.border.subtle,
      }}
    >
      {total > 0
        ? sleepStages.map((stage) => {
            const value = stages[stage];
            if (value <= 0) return null;
            return (
              <View
                key={stage}
                style={{ flex: value, backgroundColor: stageColor(theme, stage) }}
              />
            );
          })
        : null}
    </View>
  );
}
