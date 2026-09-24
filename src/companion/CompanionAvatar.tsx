import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { type ViewStyle } from 'react-native';
import Rive, { type RiveRef, type RNRiveError } from 'rive-react-native';
import { CompanionState, type CompanionAvatarHandle } from './companionState';
import { CompanionFace } from './CompanionFace';

export { CompanionState, type CompanionAvatarHandle } from './companionState';

const ARTBOARD_NAME = 'companion';
const STATE_MACHINE_NAME = 'mood';

const INPUT_STATE = 'state';
const INPUT_AUDIO_LEVEL = 'audioLevel';
const INPUT_VALENCE = 'valence';
const TRIGGER_BLINK = 'blink';
const TRIGGER_NOD = 'nod';
const TRIGGER_CELEBRATE = 'celebrate';

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function clampValence(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(-1, n));
}

interface CompanionAvatarProps {
  style?: ViewStyle;
  /** Loud opt-out for e.g. `AccessibilityInfo.isReduceMotionEnabled()` — freezes on the idle pose. */
  reducedMotion?: boolean;
}

/**
 * Thin, dumb rendering wrapper around the `companion.riv` state machine.
 * Owns no conversation/voice logic — `useVoiceLoop` (and `enterCrisis`
 * callers) drive it entirely through the imperative ref, exactly the way
 * `AnimatedLottie` elsewhere in the app stays a pure rendering component.
 *
 * Native only — see `CompanionAvatar.web.tsx` for the web variant.
 * `rive-react-native` calls `requireNativeComponent` at module-import time
 * with no web implementation, so this file must never be evaluated on web;
 * Metro/webpack picks the `.web.tsx` sibling for web builds automatically.
 *
 * Inputs set before the Rive view reports `onPlay` (first load) are buffered
 * in refs and re-applied once it's ready, since the native side drops calls
 * made before the artboard/state machine exist.
 */
export const CompanionAvatar = forwardRef<CompanionAvatarHandle, CompanionAvatarProps>(
  function CompanionAvatar({ style, reducedMotion = false }, ref) {
    const riveRef = useRef<RiveRef>(null);
    // Takes over once `failed` flips — every handle call below is forwarded to
    // it as well, so the voice loop keeps driving the avatar unchanged.
    const faceRef = useRef<CompanionAvatarHandle>(null);
    const ready = useRef(false);
    // `assets/rive/companion.riv` is a design-owned asset (missing/malformed
    // until the real file lands, or just fails to parse on some device) —
    // never let that take the whole Companion screen down.
    const [failed, setFailed] = useState(false);
    const pending = useRef({
      state: CompanionState.Idle,
      audioLevel: 0,
      valence: 0,
    });

    const setInput = (name: string, value: number) => {
      if (!ready.current) return;
      try {
        riveRef.current?.setInputState(STATE_MACHINE_NAME, name, value);
      } catch {
        // Rive view can be mid-teardown (e.g. screen blur) — never crash the voice loop over it.
      }
    };

    const fireTrigger = (name: string) => {
      if (!ready.current) return;
      try {
        riveRef.current?.fireState(STATE_MACHINE_NAME, name);
      } catch {
        // Same rationale as setInput.
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        setState: (state) => {
          pending.current.state = state;
          setInput(INPUT_STATE, state);
          faceRef.current?.setState(state);
        },
        setAudioLevel: (level) => {
          const clamped = clamp01(level);
          pending.current.audioLevel = clamped;
          setInput(INPUT_AUDIO_LEVEL, clamped);
          faceRef.current?.setAudioLevel(clamped);
        },
        setValence: (valence) => {
          const clamped = clampValence(valence);
          pending.current.valence = clamped;
          setInput(INPUT_VALENCE, clamped);
          faceRef.current?.setValence(clamped);
        },
        blink: () => {
          fireTrigger(TRIGGER_BLINK);
          faceRef.current?.blink();
        },
        nod: () => {
          fireTrigger(TRIGGER_NOD);
          faceRef.current?.nod();
        },
        celebrate: () => {
          fireTrigger(TRIGGER_CELEBRATE);
          faceRef.current?.celebrate();
        },
      }),
      [],
    );

    const handlePlay = () => {
      ready.current = true;
      // Re-apply whatever the caller asked for before the view was ready.
      setInput(INPUT_STATE, pending.current.state);
      setInput(INPUT_AUDIO_LEVEL, pending.current.audioLevel);
      setInput(INPUT_VALENCE, pending.current.valence);
    };

    const handleError = (error: RNRiveError) => {
      ready.current = false;
      setFailed(true);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[CompanionAvatar] Rive load failed — check assets/rive/companion.riv', error);
      }
    };

    if (failed) {
      // `initialState` replays whatever was set while Rive was still loading —
      // the face mounts after those calls, so it can't have received them.
      return (
        <CompanionFace
          ref={faceRef}
          style={style}
          reducedMotion={reducedMotion}
          initialState={pending.current.state}
        />
      );
    }

    if (reducedMotion) {
      // Idle timeline still "runs always" per the design contract, but skip
      // mounting the animated view entirely under reduced motion — the base
      // idle pose (first frame) renders via Rive's own autoplay-less fallback.
      return (
        <Rive
          ref={riveRef}
          source={require('../../assets/rive/companion.riv')}
          artboardName={ARTBOARD_NAME}
          stateMachineName={STATE_MACHINE_NAME}
          autoplay={false}
          style={style}
          onError={handleError}
        />
      );
    }

    return (
      <Rive
        ref={riveRef}
        source={require('../../assets/rive/companion.riv')}
        artboardName={ARTBOARD_NAME}
        stateMachineName={STATE_MACHINE_NAME}
        autoplay
        style={style}
        onPlay={handlePlay}
        onError={handleError}
      />
    );
  },
);
