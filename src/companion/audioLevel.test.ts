import { describe, expect, it } from 'vitest';
import { clamp01, createLevelSmoother, dbToUnitLevel } from './audioLevel';

/**
 * The signal path feeding the avatar: mic dB → 0..1, and the smoothing that
 * stops the mouth/glow jittering. Pure functions, so they are testable here
 * even though the TTS/STT modules around them are native.
 */

describe('clamp01', () => {
  it('passes values already in range', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
  });

  it('clamps out-of-range values instead of letting them reach the avatar', () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(42)).toBe(1);
  });

  it('treats NaN as silence rather than propagating it', () => {
    // A NaN would make the Rive input NaN and freeze the mouth open.
    expect(clamp01(NaN)).toBe(0);
  });
});

describe('dbToUnitLevel', () => {
  it('maps the documented -2..10 dB range onto 0..1', () => {
    expect(dbToUnitLevel(-2)).toBe(0);
    expect(dbToUnitLevel(10)).toBe(1);
    expect(dbToUnitLevel(4)).toBeCloseTo(0.5, 5);
  });

  it('clamps readings outside the range (the scale is not calibrated)', () => {
    expect(dbToUnitLevel(-50)).toBe(0);
    expect(dbToUnitLevel(120)).toBe(1);
  });

  it('accepts a custom range', () => {
    expect(dbToUnitLevel(0, 0, 100)).toBe(0);
    expect(dbToUnitLevel(50, 0, 100)).toBe(0.5);
  });
});

describe('createLevelSmoother', () => {
  it('starts silent', () => {
    expect(createLevelSmoother().next(0)).toBe(0);
  });

  it('approaches a held value without overshooting it', () => {
    const smoother = createLevelSmoother(0.35);
    let value = 0;
    for (let tick = 0; tick < 25; tick++) value = smoother.next(1);

    expect(value).toBeGreaterThan(0.99);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('moves gradually, which is the whole point', () => {
    const smoother = createLevelSmoother(0.35);
    const first = smoother.next(1);

    // A single loud frame must not slam the avatar to full.
    expect(first).toBeCloseTo(0.35, 5);
    expect(smoother.next(1)).toBeGreaterThan(first);
  });

  it('decays back toward silence when the input stops', () => {
    const smoother = createLevelSmoother(0.35);
    for (let tick = 0; tick < 20; tick++) smoother.next(1);

    const loud = smoother.next(1);
    const quieter = smoother.next(0);
    expect(quieter).toBeLessThan(loud);
  });

  it('clamps its input, so a bad reading cannot poison the running average', () => {
    const smoother = createLevelSmoother(1);
    expect(smoother.next(99)).toBe(1);
    expect(smoother.next(NaN)).toBe(0);
  });

  it('reset() returns it to silence', () => {
    const smoother = createLevelSmoother(0.5);
    smoother.next(1);
    smoother.reset();
    expect(smoother.next(0)).toBe(0);
  });

  it('honours a faster alpha', () => {
    expect(createLevelSmoother(0.9).next(1)).toBeCloseTo(0.9, 5);
  });
});
