import type { Theme } from '../../../ui/theme';
import type { Severity, MatchStrength } from '../models/checkerContent';

/** Severity → semantic status/accent tokens (never raw hexes — spec §7). */
export function severityColor(theme: Theme, severity: Severity): string {
  switch (severity) {
    case 'lowToMild':
      return theme.colors.status.success;
    case 'moderate':
      return theme.colors.status.warning;
    case 'severe':
      return theme.colors.accent.steps;
    case 'verySevere':
      return theme.colors.status.error;
  }
}

/** Match strength → accent tokens (High=warm, Medium=lavender, Low=moss). */
export function matchColor(theme: Theme, strength: MatchStrength): string {
  switch (strength) {
    case 'high':
      return theme.colors.accent.steps;
    case 'medium':
      return theme.colors.accent.sleep;
    case 'low':
      return theme.colors.status.success;
  }
}
