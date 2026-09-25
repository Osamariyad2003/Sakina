import type { SpeechOptions } from 'expo-speech';
import type { TtsProvider, TtsSpeakOptions } from './ttsProvider';

/**
 * The slice of `expo-speech` this provider uses. Declared as an interface so
 * the envelope logic below can be exercised with a fake engine — the real
 * module is native and cannot load under the test runner.
 */
export interface SpeechEngine {
  speak(text: string, options: SpeechOptions): void;
  stop(): void;
}

// Synthesized envelope tick rate. Fast enough to read as "reacting to audio"
// on the avatar's glow/mouth, slow enough not to burn battery on a timer.
const TICK_MS = 50;

/**
 * `expo-speech` gives no amplitude or viseme data — see `ttsProvider.ts`.
 * This fakes a plausible mouth/glow envelope with a smoothed sine + jitter
 * signal for the duration of speech, driven by `onStart`/`onDone` from the
 * native TTS engine (so it still tracks *when* speech is actually playing,
 * even though it can't track *how loud*).
 */
export function createSpeechProvider(engine: SpeechEngine): TtsProvider {
  let tickHandle: ReturnType<typeof setInterval> | null = null;
  let tickPhase = 0;
  let stopped = false;

  function clearTick() {
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  }

  function speak(text: string, options: TtsSpeakOptions) {
    stopped = false;
    tickPhase = 0;

    engine.speak(text, {
      language: options.locale,
      onStart: () => {
        clearTick();
        tickHandle = setInterval(() => {
          if (stopped) return;
          tickPhase += 1;
          // Base breathing sine (0..1) plus small jitter so it doesn't look robotic.
          const base = (Math.sin(tickPhase / 4) + 1) / 2;
          const jitter = Math.random() * 0.15;
          const level = Math.min(1, Math.max(0, base * 0.7 + jitter));
          options.onAmplitude(level);
        }, TICK_MS);
      },
      onDone: () => {
        clearTick();
        options.onAmplitude(0);
        if (!stopped) options.onDone();
      },
      onStopped: () => {
        clearTick();
        options.onAmplitude(0);
      },
      onError: (error) => {
        clearTick();
        options.onAmplitude(0);
        options.onError(error);
      },
    });
  }

  function stop() {
    stopped = true;
    clearTick();
    engine.stop();
  }

  return { speak, stop };
}
