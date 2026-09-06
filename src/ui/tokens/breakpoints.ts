/** Width buckets — phone is the primary target (spec §29); tablet/foldable secondary. */
export const breakpoints = {
  phone: 0,
  phoneLg: 400,
  tablet: 768,
} as const;

export type DeviceBucket = 'phone' | 'phoneLg' | 'tablet';

export function bucketForWidth(width: number): DeviceBucket {
  if (width >= breakpoints.tablet) return 'tablet';
  if (width >= breakpoints.phoneLg) return 'phoneLg';
  return 'phone';
}
