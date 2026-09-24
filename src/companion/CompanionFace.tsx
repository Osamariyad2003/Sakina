import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { clamp01 } from './audioLevel';
import { CompanionState, type CompanionAvatarHandle } from './companionState';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Fixed palette from the Rafiq state sheet — the avatar reads the same in light and dark themes. */
const palette = {
  halo: '#7F928A',
  body: '#A8DCC8',
  face: '#D8EFE6',
  faceSpeaking: '#EEF7F3',
  feature: '#2F5D4F',
  listenRing: '#E8C77A',
  wave: '#5FA88D',
  crisisBody: '#C5CEC9',
  crisisFace: '#DFE5E2',
  crisisFeature: '#6E7A75',
};

const AUTO_BLINK_MS = 4500;
const CRISIS_SCALE = 0.62;

interface CompanionFaceProps {
  style?: ViewStyle;
  reducedMotion?: boolean;
  /** State to show on mount — used when the native Rive view fails after inputs were already set. */
  initialState?: CompanionState;
}

/**
 * Code-drawn Rafiq avatar (react-native-svg + Reanimated) matching the design
 * state sheet: listening (dot eyes, dashed ring, leans in), reflecting
 * (closed eyes, slow breath), speaking (open mouth + sound waves driven by
 * `audioLevel`) and crisis handoff (smaller, desaturated, flat eyes).
 *
 * Exposes the same imperative handle as the Rive avatar so `useVoiceLoop`
 * drives either one without knowing which is mounted.
 */
export const CompanionFace = forwardRef<CompanionAvatarHandle, CompanionFaceProps>(
  function CompanionFace({ style, reducedMotion = false, initialState = CompanionState.Idle }, ref) {
    const systemReducedMotion = useReducedMotion();
    const still = reducedMotion || systemReducedMotion;
    const [state, setState] = useState(initialState);

    const audioLevel = useSharedValue(0);
    const breath = useSharedValue(1);
    const baseScale = useSharedValue(1);
    const lean = useSharedValue(0);
    const bounce = useSharedValue(0);
    const pulse = useSharedValue(1);
    const eyeOpen = useSharedValue(1);
    const ringSpin = useSharedValue(0);

    const blink = () => {
      if (still) return;
      eyeOpen.value = withSequence(withTiming(0.1, { duration: 90 }), withTiming(1, { duration: 140 }));
    };

    useImperativeHandle(
      ref,
      () => ({
        setState,
        setAudioLevel: (level) => {
          audioLevel.value = withTiming(clamp01(level), { duration: 80 });
        },
        // No valence-specific pose in the state sheet yet.
        setValence: () => {},
        blink,
        nod: () => {
          if (still) return;
          bounce.value = withSequence(withTiming(4, { duration: 160 }), withTiming(0, { duration: 220 }));
        },
        celebrate: () => {
          if (still) return;
          pulse.value = withSequence(withTiming(1.08, { duration: 180 }), withTiming(1, { duration: 320 }));
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [still],
    );

    const isCrisis = state === CompanionState.Crisis;
    const isListening = state === CompanionState.Listening;
    const isReflecting = state === CompanionState.Reflecting;
    const isSpeaking = state === CompanionState.Speaking;

    useEffect(() => {
      const ease = Easing.inOut(Easing.quad);
      baseScale.value = withTiming(isCrisis ? CRISIS_SCALE : isListening ? 1.04 : 1, { duration: 500, easing: ease });
      lean.value = withTiming(isListening ? 3 : 0, { duration: 400, easing: ease });

      cancelAnimation(breath);
      cancelAnimation(ringSpin);
      if (still || isCrisis) {
        breath.value = withTiming(1, { duration: 300 });
        return;
      }
      const period = isReflecting ? 2400 : 1800;
      breath.value = withRepeat(withTiming(1.03, { duration: period, easing: ease }), -1, true);
      if (isListening) {
        ringSpin.value = 0;
        ringSpin.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, still]);

    useEffect(() => {
      if (still || isCrisis || isReflecting) return;
      const id = setInterval(blink, AUTO_BLINK_MS);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, still]);

    const bodyStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: lean.value + bounce.value },
        { scale: baseScale.value * breath.value * pulse.value },
      ],
    }));

    const ringStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${ringSpin.value}deg` }],
    }));

    const eyeProps = useAnimatedProps(() => ({ ry: 6.5 * eyeOpen.value }));
    const mouthProps = useAnimatedProps(() => ({ ry: 3 + audioLevel.value * 6 }));
    const innerWaveProps = useAnimatedProps(() => ({ opacity: 0.35 + audioLevel.value * 0.65 }));
    const outerWaveProps = useAnimatedProps(() => ({ opacity: 0.15 + audioLevel.value * 0.6 }));

    const featureColor = isCrisis ? palette.crisisFeature : palette.feature;

    return (
      <View style={[style, { pointerEvents: 'none' }]}>
        {isListening ? (
          <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, ringStyle]}>
            <Svg width="100%" height="100%" viewBox="0 0 160 160">
              <Circle
                cx={80}
                cy={80}
                r={77}
                stroke={palette.listenRing}
                strokeWidth={1.5}
                strokeDasharray="3 5"
                fill="none"
              />
            </Svg>
          </Animated.View>
        ) : null}

        <Animated.View style={[{ flex: 1 }, bodyStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 160 160">
            {isCrisis ? null : <Ellipse cx={80} cy={80} rx={66} ry={70} fill={palette.halo} />}
            <Ellipse cx={80} cy={80} rx={54} ry={60} fill={isCrisis ? palette.crisisBody : palette.body} />
            <Ellipse
              cx={80}
              cy={isSpeaking ? 82 : 78}
              rx={isSpeaking ? 36 : 32}
              ry={isSpeaking ? 38 : 34}
              fill={isCrisis ? palette.crisisFace : isSpeaking ? palette.faceSpeaking : palette.face}
            />

            {isCrisis ? (
              <Path d="M60 78 H73 M87 78 H100" stroke={featureColor} strokeWidth={3.5} strokeLinecap="round" />
            ) : isReflecting ? (
              <Path
                d="M60 76 Q67 83 74 76 M86 76 Q93 83 100 76"
                stroke={featureColor}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <AnimatedEllipse cx={68} cy={isSpeaking ? 74 : 76} rx={6.5} fill={featureColor} animatedProps={eyeProps} />
                <AnimatedEllipse cx={92} cy={isSpeaking ? 74 : 76} rx={6.5} fill={featureColor} animatedProps={eyeProps} />
              </>
            )}

            {isSpeaking ? (
              <AnimatedEllipse cx={80} cy={100} rx={9} fill={featureColor} animatedProps={mouthProps} />
            ) : state === CompanionState.Encouraging ? (
              <Path d="M72 94 Q80 101 88 94" stroke={featureColor} strokeWidth={3} strokeLinecap="round" fill="none" />
            ) : null}

            {isSpeaking ? (
              <>
                <AnimatedPath
                  d="M140 68 Q148 80 140 92"
                  stroke={palette.wave}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                  animatedProps={innerWaveProps}
                />
                <AnimatedPath
                  d="M147 60 Q159 80 147 100"
                  stroke={palette.wave}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                  animatedProps={outerWaveProps}
                />
              </>
            ) : null}
          </Svg>
        </Animated.View>
      </View>
    );
  },
);
