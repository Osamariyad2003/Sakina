import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { companionService } from '../features/ai-companion/services/companionService';
import { CompanionState, type CompanionAvatarHandle } from './CompanionAvatar';
import { expoSpeechProvider } from './tts/expoSpeechProvider';
import { createLevelSmoother, dbToUnitLevel } from './audioLevel';

export type VoiceLoopStatus = 'idle' | 'listening' | 'reflecting' | 'speaking' | 'crisis';

/** Deliberate pause between "you finished talking" and "companion speaks" — spec'd 600–900ms. */
const REFLECTING_BEAT_MS = 750;

const DEFAULT_LOCALE = 'ar-JO';
const DEFAULT_FALLBACK_LOCALE = 'en-US';

interface UseVoiceLoopOptions {
  /** Same ref passed to `<CompanionAvatar ref={...} />` — this hook drives it directly. */
  avatarRef: RefObject<CompanionAvatarHandle | null>;
  /** STT locale, default `ar-JO`. */
  locale?: string;
  /** Retried once if `locale` fails to start (unsupported on-device), default `en-US`. */
  fallbackLocale?: string;
  /**
   * Fired exactly once when `enterCrisis()` runs (either from a risk-flagged
   * reply, or called directly by the caller for the same keyword logic the
   * text chat already uses). The caller owns navigation to the Safety screen —
   * this hook only owns the avatar/audio side of receding.
   */
  onCrisis?: () => void;
}

/**
 * Orchestrates one voice "turn" (listen → reflect → speak) and drives the
 * avatar purely through `avatarRef`'s imperative handle. Reuses
 * `companionService.sendMessage` — the exact function the text chat screen
 * already calls — for the reply text and its risk detection, so there is
 * exactly one place that decides "this is a crisis", not a second one
 * reimplemented for voice.
 */
export function useVoiceLoop({
  avatarRef,
  locale = DEFAULT_LOCALE,
  fallbackLocale = DEFAULT_FALLBACK_LOCALE,
  onCrisis,
}: UseVoiceLoopOptions) {
  const [status, setStatus] = useState<VoiceLoopStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inputSmoother = useRef(createLevelSmoother());
  const activeLocale = useRef(locale);
  const fellBack = useRef(false);
  // Crisis is a one-way gate: every handler below checks this before touching
  // status/avatar so nothing can accidentally pull the UI back out of crisis.
  const inCrisis = useRef(false);

  const resetAvatarToIdle = useCallback(() => {
    avatarRef.current?.setState(CompanionState.Idle);
    avatarRef.current?.setAudioLevel(0);
  }, [avatarRef]);

  const enterCrisis = useCallback(() => {
    if (inCrisis.current) return;
    inCrisis.current = true;
    expoSpeechProvider.stop();
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Not currently recognizing — nothing to stop.
    }
    avatarRef.current?.setState(CompanionState.Crisis);
    avatarRef.current?.setAudioLevel(0);
    setStatus('crisis');
    onCrisis?.();
  }, [avatarRef, onCrisis]);

  /** The ONLY way out of crisis — must be called explicitly by the user leaving the crisis flow, never automatically. */
  const reset = useCallback(() => {
    inCrisis.current = false;
    fellBack.current = false;
    inputSmoother.current.reset();
    resetAvatarToIdle();
    setStatus('idle');
    setTranscript('');
    setError(null);
  }, [resetAvatarToIdle]);

  const speakReply = useCallback(
    (replyText: string) => {
      if (inCrisis.current) return;
      setStatus('speaking');
      avatarRef.current?.setState(CompanionState.Speaking);
      inputSmoother.current.reset();
      expoSpeechProvider.speak(replyText, {
        locale: activeLocale.current,
        onAmplitude: (level) => {
          if (inCrisis.current) return;
          avatarRef.current?.setAudioLevel(level);
        },
        onDone: () => {
          if (inCrisis.current) return;
          resetAvatarToIdle();
          setStatus('idle');
        },
        onError: () => {
          if (inCrisis.current) return;
          setError('tts_error');
          resetAvatarToIdle();
          setStatus('idle');
        },
      });
    },
    [avatarRef, resetAvatarToIdle],
  );

  const handleFinalTranscript = useCallback(
    async (text: string) => {
      if (inCrisis.current || !text.trim()) return;

      setStatus('reflecting');
      avatarRef.current?.setState(CompanionState.Reflecting);
      avatarRef.current?.setAudioLevel(0);
      const reflectBeat = new Promise((resolve) => setTimeout(resolve, REFLECTING_BEAT_MS));

      try {
        // The same function the AI Companion chat screen uses — including
        // its client-side risk short-circuit. No separate AI backend here.
        const [result] = await Promise.all([
          // Reply language follows the recognition locale this loop is running in.
          companionService.sendMessage(text.trim(), {
            language: activeLocale.current.startsWith('en') ? 'en' : 'ar',
          }),
          reflectBeat,
        ]);

        if (inCrisis.current) return;

        if (result.riskDetected) {
          enterCrisis();
          return;
        }

        speakReply(result.assistantMessage.content);
      } catch {
        if (inCrisis.current) return;
        setError('companion_unavailable');
        resetAvatarToIdle();
        setStatus('idle');
      }
    },
    [avatarRef, enterCrisis, resetAvatarToIdle, speakReply],
  );

  // --- STT event wiring --------------------------------------------------

  useSpeechRecognitionEvent('start', () => {
    if (inCrisis.current) return;
    setStatus('listening');
    avatarRef.current?.setState(CompanionState.Listening);
  });

  useSpeechRecognitionEvent('volumechange', (event) => {
    if (inCrisis.current) return;
    const level = inputSmoother.current.next(dbToUnitLevel(event.value));
    avatarRef.current?.setAudioLevel(level);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (inCrisis.current) return;
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    if (event.isFinal) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Already stopped by the engine on final result on some platforms.
      }
      void handleFinalTranscript(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (inCrisis.current) return;

    // One retry in the fallback locale before surfacing an error — covers
    // devices without an on-device Arabic recognizer installed.
    if (!fellBack.current && activeLocale.current !== fallbackLocale) {
      fellBack.current = true;
      activeLocale.current = fallbackLocale;
      try {
        ExpoSpeechRecognitionModule.start({
          lang: fallbackLocale,
          interimResults: true,
          continuous: false,
          volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
        });
        return;
      } catch {
        // Fall through to the error surface below.
      }
    }

    setError(event.message ?? event.error ?? 'speech_recognition_error');
    resetAvatarToIdle();
    setStatus('idle');
  });

  // --- Public API ----------------------------------------------------------

  const start = useCallback(async () => {
    if (inCrisis.current || status === 'listening') return;
    setError(null);
    setTranscript('');
    fellBack.current = false;
    activeLocale.current = locale;

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('permission_denied');
      return;
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: activeLocale.current,
        interimResults: true,
        continuous: false,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
    } catch {
      setError('speech_recognition_unavailable');
    }
  }, [locale, status]);

  const stop = useCallback(() => {
    if (inCrisis.current) return;
    if (status === 'listening') {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Nothing to stop.
      }
    } else if (status === 'speaking') {
      expoSpeechProvider.stop();
      resetAvatarToIdle();
      setStatus('idle');
    }
  }, [status, resetAvatarToIdle]);

  useEffect(
    () => () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        // Unmounting mid-listen is fine to no-op.
      }
      expoSpeechProvider.stop();
    },
    [],
  );

  return { start, stop, status, transcript, error, enterCrisis, reset };
}
