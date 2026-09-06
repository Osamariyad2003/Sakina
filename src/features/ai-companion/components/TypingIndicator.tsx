import React, { useEffect } from 'react';
import { View, AccessibilityInfo } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';

function Dot({ delayMs }: { delayMs: number }) {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 350 }), withTiming(0.3, { duration: 350 })),
        -1,
        false,
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.text.secondary, marginHorizontal: 2 },
        style,
      ]}
    />
  );
}

/** "AI Thinking" state (spec §16) — shown before the first streamed token arrives. */
export function TypingIndicator() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={t('companion.thinking')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.subtle,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        marginVertical: theme.spacing.xxs,
      }}
    >
      {/* "Listening"/thinking animation. Drop a licensed iconscout Lottie over
          assets/lottie/listening.json to upgrade — the hand-authored three-dot
          pulse below is the reduced-motion / load-failure fallback. */}
      <AnimatedLottie
        source={require('../../../../assets/lottie/listening.json')}
        style={{ width: 48, height: 20 }}
        fallback={
          <>
            <Dot delayMs={0} />
            <Dot delayMs={150} />
            <Dot delayMs={300} />
          </>
        }
      />
    </View>
  );
}
