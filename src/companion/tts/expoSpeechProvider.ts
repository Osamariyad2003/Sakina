import * as Speech from 'expo-speech';
import { createSpeechProvider } from './speechProvider';

/**
 * The app's TTS provider, bound to the real native engine.
 *
 * The envelope logic lives in `speechProvider.ts`, which imports `expo-speech`
 * for types only — that split is what lets the timing behaviour be tested
 * under the Node test runner, where a native module cannot load.
 */
export const expoSpeechProvider = createSpeechProvider(Speech);
export type { SpeechEngine } from './speechProvider';
