import type { Theme } from '../../../../ui/theme';
import type { SleepStage, SleepQualityRating } from '../models/sleepContent';

/**
 * Maps sleep stages and quality ratings onto Sakina's own semantic/accent
 * tokens (never raw hexes — spec §7). The design's stage palette
 * (green/olive/gold/orange/purple) is reproduced entirely from existing
 * botanical-warm tokens plus the new desaturated `accent.sleep` lavender.
 */
export function stageColor(theme: Theme, stage: SleepStage): string {
  switch (stage) {
    case 'deep':
      return theme.colors.accent.sleep;
    case 'core':
      return theme.colors.brand.primary;
    case 'rem':
      return theme.colors.accent.reflection;
    case 'awake':
      return theme.colors.accent.steps;
  }
}

export function ratingColor(theme: Theme, rating: SleepQualityRating): string {
  switch (rating) {
    case 'normal':
      return theme.colors.status.success;
    case 'core':
      return theme.colors.brand.primary;
    case 'rem':
      return theme.colors.accent.reflection;
    case 'irregular':
      return theme.colors.accent.steps;
    case 'insomniac':
      return theme.colors.accent.sleep;
  }
}
