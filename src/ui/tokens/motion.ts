/**
 * Motion tokens — spec §31. Calm, subtle. Reanimated/Moti durations & easing
 * should reference these rather than hardcoding numbers per-screen.
 */
export const motion = {
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
    breathIn: 4000,
    breathHold: 2000,
    breathOut: 6000,
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
    gentle: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
} as const;
