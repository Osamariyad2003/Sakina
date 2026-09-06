import React, { useEffect, useState } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useWellbeingReflectionQuery, useTrackerSignalsQuery } from '../state/useHomeQueries';
import type { AppError } from '../../../core/errors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = 48;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Reanimated stand-in for the real Lottie ring (deferred to the animations
 * checkpoint — see ASSUMPTIONS.md). Fill = check-in consistency
 * (`checkInsLast7 / 7`), never a score or percentage rendered as text —
 * this is explicitly NOT the reference's "Freud Score" gauge. Respects
 * reduced-motion by jumping straight to the target value instead of
 * animating in.
 */
function ConsistencyRing({ progress }: { progress: number }) {
  const theme = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const dashOffset = useSharedValue(RING_CIRCUMFERENCE);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  }, []);

  useEffect(() => {
    const target = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
    dashOffset.value = reducedMotion ? target : withTiming(target, { duration: 700, easing: Easing.out(Easing.ease) });
  }, [progress, reducedMotion, dashOffset]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: dashOffset.value }));

  return (
    // Rotated via a wrapping View transform (not react-native-svg's own
    // `rotation`/`origin` props) — those emit an invalid `transform-origin`
    // DOM attribute under react-native-web.
    <View style={{ width: RING_SIZE, height: RING_SIZE, transform: [{ rotate: '-90deg' }] }}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={theme.colors.border.subtle}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={theme.colors.accent.reflection}
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

/**
 * Structure: reference's hero "Freud Score" card with an animated ring —
 * reframed into a non-diagnostic, qualitative summary. See ASSUMPTIONS.md
 * "Wellbeing Reflection" reframe: no score, no diagnosis label, no
 * risk/disorder percentage anywhere (explicitly prohibited by this
 * prompt's rule 2). The reference's "what is this?" explainer sheet lands
 * in a later checkpoint. The ring now layers a looping Lottie "breathing"
 * glow (`reflectionRing.json`, a hand-authored placeholder — see
 * ASSUMPTIONS.md) behind the data-driven `ConsistencyRing`: Lottie can't
 * encode the real check-in-consistency value, so the actual progress
 * indicator stays the Reanimated ring; Lottie adds only ambient motion.
 * `ConsistencyRing` is also `AnimatedLottie`'s reduced-motion/load-failure
 * fallback, so the card never loses its real data if the animation can't
 * play.
 * Styling: theme.spacing/theme.colors + our extended `accent.reflection`
 * token ("Botanical & warm," confirmed with the product owner) +
 * Card/AppText/Badge/SkeletonList/ErrorState — no reference values.
 */
export function WellbeingReflectionCard() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useWellbeingReflectionQuery();
  const trackersQuery = useTrackerSignalsQuery();
  const checkIns = trackersQuery.data?.find((s) => s.key === 'checkIns')?.value ?? 0;

  return (
    <Card style={{ width: 280, minHeight: 150, borderTopWidth: 3, borderTopColor: theme.colors.accent.reflection }} elevation="md">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="label" color={theme.colors.text.secondary} style={{ flex: 1 }}>
          {t('home.reflectionCardTitle')}
        </AppText>
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <AnimatedLottie
            source={require('../../../../assets/lottie/reflectionRing.json')}
            style={{ position: 'absolute', width: RING_SIZE * 1.6, height: RING_SIZE * 1.6, opacity: 0.35 }}
            fallback={null}
          />
          <ConsistencyRing progress={checkIns / 7} />
        </View>
      </View>

      {query.isLoading ? (
        <View style={{ marginTop: theme.spacing.xs }}>
          <SkeletonList rows={2} rowHeight={16} />
        </View>
      ) : query.isError ? (
        <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
      ) : query.data ? (
        <>
          <AppText variant="body" style={{ marginTop: theme.spacing.xs }}>
            {isArabic ? query.data.summaryAr : query.data.summaryEn}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.sm }}>
            {query.data.journalingDaysLast7 > 0 ? (
              <Badge label={t('home.journalingDaysChip', { count: query.data.journalingDaysLast7 })} color={theme.colors.accent.journaling} />
            ) : null}
            {query.data.stressSessionsLast7 > 0 ? (
              <Badge label={t('home.stressSessionsChip', { count: query.data.stressSessionsLast7 })} color={theme.colors.accent.mindful} />
            ) : null}
          </View>
        </>
      ) : null}
    </Card>
  );
}
