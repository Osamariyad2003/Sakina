/** Fixed component sizing outside the spacing/radius scales — OS/WCAG minimums. */
export const sizes = {
  touchTarget: 44, // iOS HIG / Android a11y minimum tappable area (spec §30)
  controlHeight: 40, // secondary control height (segmented control / tab chip)
} as const;

export type SizeKey = keyof typeof sizes;
