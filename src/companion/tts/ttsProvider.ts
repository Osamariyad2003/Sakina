/**
 * Seam between the voice loop and whatever actually speaks the reply.
 * `expo-speech` (the current implementation, see `expoSpeechProvider.ts`)
 * exposes no viseme/amplitude timing, so it can only *simulate* an
 * amplitude envelope while it talks. Isolating that behind this interface
 * means swapping in a real viseme-capable cloud TTS later only means
 * writing a new provider — `useVoiceLoop` and `CompanionAvatar` don't change.
 */
export interface TtsSpeakOptions {
  /** BCP-47 locale, e.g. `ar-JO`. */
  locale: string;
  /** Called ~15–30x/sec for the duration of speech with a smoothed 0..1 level. */
  onAmplitude: (level: number) => void;
  onDone: () => void;
  onError: (error: unknown) => void;
}

export interface TtsProvider {
  speak(text: string, options: TtsSpeakOptions): void;
  /** Stops speech immediately and fires no further `onAmplitude`/`onDone`. Must be safe to call when idle. */
  stop(): void;
}
