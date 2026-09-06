import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
}

/** Used for e.g. Mood history Week/Month toggle. */
export function SegmentedControl({ segments, value, onChange }: SegmentedControlProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.xxs,
        borderWidth: 1,
        borderColor: theme.colors.border.subtle,
      }}
    >
      {segments.map((segment) => {
        const active = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(segment.key);
            }}
            style={{
              flex: 1,
              minHeight: theme.sizes.controlHeight,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.sm,
              backgroundColor: active ? theme.colors.brand.primary : 'transparent',
            }}
          >
            <AppText variant="label" color={active ? theme.colors.text.onBrand : theme.colors.text.secondary}>
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
