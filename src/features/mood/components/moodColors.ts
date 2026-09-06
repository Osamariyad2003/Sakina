import type { Theme } from '../../../ui/theme';
import type { MoodLevel } from '../../../types/models';

/**
 * Maps each mood level onto Sakina's own accent/status tokens (never raw
 * hexes — spec §7). The Figma selector's per-mood backgrounds
 * (purple/orange/brown/gold/green) are reproduced entirely from existing
 * botanical-warm tokens.
 */
export function moodColor(theme: Theme, level: MoodLevel): string {
  switch (level) {
    case 'veryLow': // Depressed
      return theme.colors.accent.sleep; // soft lavender/purple
    case 'low': // Sad
      return theme.colors.accent.steps; // terracotta/orange
    case 'neutral': // Neutral
      return theme.colors.brand.accent; // warm clay/brown
    case 'good': // Happy
      return theme.colors.accent.reflection; // gold
    case 'veryGood': // Overjoyed
      return theme.colors.status.success; // moss green
  }
}
