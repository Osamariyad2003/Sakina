import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../ui/theme';
import { AppText } from '../../../ui/primitives';
import { moodColor } from './moodColors';
import { moodLevels } from '../models/moodContent';
import type { MoodLevel } from '../../../types/models';

interface MoodBubblesProps {
  /** Count of check-ins per mood level. */
  counts: Record<MoodLevel, number>;
}

/**
 * The Mood-Overview "bubbles" — one circle per mood level sized by its share
 * of check-ins. Pure View/token layout; the largest count reads biggest.
 * Wraps and centers, so it stays legible in both directions.
 */
export function MoodBubbles({ counts }: MoodBubblesProps) {
  const theme = useTheme();
  const max = Math.max(1, ...moodLevels.map((m) => counts[m.level]));

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.sm }}>
      {moodLevels.map((option) => {
        const count = counts[option.level];
        if (count <= 0) return null;
        const size = 48 + (count / max) * 72;
        return (
          <View
            key={option.level}
            style={{
              width: size,
              height: size,
              borderRadius: theme.radius.pill,
              backgroundColor: moodColor(theme, option.level),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {count}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}
