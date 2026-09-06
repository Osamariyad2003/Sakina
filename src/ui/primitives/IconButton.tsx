import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: 'plain' | 'filled';
  disabled?: boolean;
}

/** Wraps any icon (mirror directional icons at the call site using I18nManager.isRTL). */
export function IconButton({ icon, onPress, accessibilityLabel, variant = 'plain', disabled }: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minWidth: theme.sizes.touchTarget,
          minHeight: theme.sizes.touchTarget,
          borderRadius: theme.radius.pill,
          backgroundColor: variant === 'filled' ? theme.colors.background.surface : 'transparent',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
