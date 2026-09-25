import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSpeechProvider, type SpeechEngine } from './speechProvider';

/**
 * TTS timing behaviour, exercised with a fake engine and fake timers.
 *
 * What this can prove: that the amplitude envelope starts when the engine
 * reports speech started, stops when it ends, is silenced by `stop()`, and
 * never fires callbacks after being stopped — the behaviours the avatar
 * depends on.
 *
 * What it cannot prove: that `expo-speech` actually produces audio on a
 * device. That is a Dev Client check (see src/companion/README.md).
 */

function fakeEngine() {
  const calls: { text: string; language?: string }[] = [];
  let handlers: Record<string, ((arg?: unknown) => void) | undefined> = {};
  let stopCount = 0;

  const engine: SpeechEngine = {
    speak(text, options) {
      calls.push({ text, language: options.language });
      handlers = {
        onStart: options.onStart as () => void,
        onDone: options.onDone as () => void,
        onStopped: options.onStopped as () => void,
        onError: options.onError as (e: unknown) => void,
      };
    },
    stop() {
      stopCount += 1;
    },
  };

  return {
    engine,
    calls,
    stopCalls: () => stopCount,
    fire: (event: 'onStart' | 'onDone' | 'onStopped' | 'onError', arg?: unknown) => handlers[event]?.(arg),
  };
}

function listener() {
  const levels: number[] = [];
  const done = vi.fn();
  const error = vi.fn();
  return {
    levels,
    done,
    error,
    options: (locale = 'ar-JO') => ({
      locale,
      onAmplitude: (level: number) => levels.push(level),
      onDone: done,
      onError: error,
    }),
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('speak', () => {
  it('passes the text and locale straight to the engine', () => {
    const { engine, calls } = fakeEngine();
    createSpeechProvider(engine).speak('مرحبا', listener().options('ar-JO'));

    expect(calls).toEqual([{ text: 'مرحبا', language: 'ar-JO' }]);
  });

  it('emits no amplitude until the engine reports speech actually started', () => {
    const { engine } = fakeEngine();
    const heard = listener();
    createSpeechProvider(engine).speak('hello', heard.options());

    vi.advanceTimersByTime(500);
    expect(heard.levels).toHaveLength(0);
  });

  it('emits a 0..1 envelope while speaking', () => {
    const { engine, fire } = fakeEngine();
    const heard = listener();
    createSpeechProvider(engine).speak('hello', heard.options());

    fire('onStart');
    vi.advanceTimersByTime(500);

    expect(heard.levels.length).toBeGreaterThan(5);
    for (const level of heard.levels) {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    }
    // Not a constant — the avatar's mouth has to move.
    expect(new Set(heard.levels).size).toBeGreaterThan(1);
  });

  it('returns to silence and reports done when speech ends', () => {
    const { engine, fire } = fakeEngine();
    const heard = listener();
    createSpeechProvider(engine).speak('hello', heard.options());

    fire('onStart');
    vi.advanceTimersByTime(300);
    fire('onDone');

    expect(heard.levels.at(-1)).toBe(0);
    expect(heard.done).toHaveBeenCalledTimes(1);

    // The timer must be gone, not merely ignored.
    const countAtDone = heard.levels.length;
    vi.advanceTimersByTime(1000);
    expect(heard.levels).toHaveLength(countAtDone);
  });

  it('reports errors and falls silent', () => {
    const { engine, fire } = fakeEngine();
    const heard = listener();
    createSpeechProvider(engine).speak('hello', heard.options());

    fire('onStart');
    vi.advanceTimersByTime(200);
    fire('onError', new Error('engine exploded'));

    expect(heard.levels.at(-1)).toBe(0);
    expect(heard.error).toHaveBeenCalledTimes(1);
    expect(heard.done).not.toHaveBeenCalled();
  });
});

describe('stop', () => {
  it('stops the engine and the envelope', () => {
    const { engine, fire, stopCalls } = fakeEngine();
    const heard = listener();
    const provider = createSpeechProvider(engine);
    provider.speak('hello', heard.options());

    fire('onStart');
    vi.advanceTimersByTime(300);
    const before = heard.levels.length;

    provider.stop();
    vi.advanceTimersByTime(1000);

    expect(stopCalls()).toBe(1);
    expect(heard.levels).toHaveLength(before);
  });

  it('never reports done after being stopped — crisis must not be followed by a reply', () => {
    const { engine, fire } = fakeEngine();
    const heard = listener();
    const provider = createSpeechProvider(engine);
    provider.speak('hello', heard.options());

    fire('onStart');
    provider.stop();
    // A late onDone from the native engine is realistic; it must be ignored.
    fire('onDone');

    expect(heard.done).not.toHaveBeenCalled();
  });

  it('is safe to call when idle', () => {
    const { engine, stopCalls } = fakeEngine();
    const provider = createSpeechProvider(engine);

    expect(() => provider.stop()).not.toThrow();
    expect(stopCalls()).toBe(1);
  });

  it('can speak again after a stop', () => {
    const { engine, fire, calls } = fakeEngine();
    const heard = listener();
    const provider = createSpeechProvider(engine);

    provider.speak('first', heard.options());
    fire('onStart');
    provider.stop();

    provider.speak('second', heard.options());
    fire('onStart');
    vi.advanceTimersByTime(200);

    expect(calls.map((c) => c.text)).toEqual(['first', 'second']);
    expect(heard.levels.length).toBeGreaterThan(0);
  });
});

describe('overlapping speech', () => {
  it('does not run two envelopes at once', () => {
    const { engine, fire } = fakeEngine();
    const heard = listener();
    const provider = createSpeechProvider(engine);

    provider.speak('first', heard.options());
    fire('onStart');
    vi.advanceTimersByTime(200);
    const afterFirst = heard.levels.length;

    provider.speak('second', heard.options());
    fire('onStart');
    heard.levels.length = 0;
    vi.advanceTimersByTime(200);

    // One envelope's worth of ticks, not two.
    expect(heard.levels.length).toBeLessThanOrEqual(afterFirst + 1);
  });
});
