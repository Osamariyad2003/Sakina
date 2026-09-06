/** Spacing scale — 4pt base grid. Consume via theme.spacing, never raw numbers in screens. */
export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
} as const;

export type SpacingKey = keyof typeof spacing;
