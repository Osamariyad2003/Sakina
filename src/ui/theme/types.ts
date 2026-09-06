import type { SemanticColors } from '../tokens/colors';
import type { Shadows } from '../tokens/shadows';
import type { spacing } from '../tokens/spacing';
import type { radius } from '../tokens/radius';
import type { sizes } from '../tokens/sizes';
import type { motion } from '../tokens/motion';
import type { ColorScheme } from '../tokens/colors';

export interface Theme {
  scheme: ColorScheme;
  colors: SemanticColors;
  spacing: typeof spacing;
  radius: typeof radius;
  sizes: typeof sizes;
  shadows: Shadows;
  motion: typeof motion;
  /** true once real Thmanyah font files are loaded; false = system-font fallback */
  fontsAvailable: boolean;
}
