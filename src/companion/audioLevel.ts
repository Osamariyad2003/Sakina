/** Shared 0..1 clamp for anything fed into `CompanionAvatar.setAudioLevel`. */
export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * Exponential moving average smoother — avoids feeding raw mic/TTS ticks
 * straight into the avatar, which reads as jitter rather than a breathing
 * glow/mouth. `alpha` closer to 1 tracks the input faster; closer to 0 is
 * smoother/laggier. 0.35 was picked by feel for a ~20fps input signal.
 */
export function createLevelSmoother(alpha = 0.35) {
  let value = 0;
  return {
    next(raw: number): number {
      const clamped = clamp01(raw);
      value = value + alpha * (clamped - value);
      return value;
    },
    reset() {
      value = 0;
    },
  };
}

/**
 * `expo-speech-recognition`'s `volumechange` event reports roughly -2..10 dB
 * on-device (platform-dependent, not a calibrated scale) rather than 0..1.
 * This is a rough linear rescale, not a calibrated loudness measure — good
 * enough for "does the glow pulse when you talk", not for anything clinical.
 */
export function dbToUnitLevel(db: number, minDb = -2, maxDb = 10): number {
  return clamp01((db - minDb) / (maxDb - minDb));
}
