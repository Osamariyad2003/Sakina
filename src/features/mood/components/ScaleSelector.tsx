import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../ui/theme';
import { AppText } from '../../../ui/primitives';

interface ScaleSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
}

/**
 * Accessible 1–N scale (the Figma sliders as a tappable segmented track).
 * A slider-with-thumb would need a new gesture/dep; segments keep the 44pt
 * touch target and work under RTL via RN's automatic row flip — no manual
 * mirroring needed. Filled segments read as the current value.
 */
export function ScaleSelector({ value, onChange, min = 1, max = 10, minLabel, midLabel, maxLabel }: ScaleSelectorProps) {
  const theme = useTheme();
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View
        accessibilityRole="adjustable"
        accessibilityValue={{ min, max, now: value }}
        style={{ flexDirection: 'row', gap: theme.spacing.xxs }}
      >
        {steps.map((step) => {
          const filled = step <= value;
          return (
            <Pressable
              key={step}
              accessibilityRole="button"
              accessibilityLabel={String(step)}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onChange(step);
              }}
              style={{
                flex: 1,
                height: 28,
                borderRadius: theme.radius.sm,
                backgroundColor: filled ? theme.colors.brand.primary : theme.colors.border.subtle,
              }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {minLabel ?? String(min)}
        </AppText>
        {midLabel ? (
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {midLabel}
          </AppText>
        ) : null}
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {maxLabel ?? String(max)}
        </AppText>
      </View>
    </View>
  );
}
