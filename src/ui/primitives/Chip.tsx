import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

/** Used for EmotionSelector / TriggerSelector chips (spec §14/§15). */
export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xxs,
        minHeight: theme.sizes.touchTarget,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: selected ? theme.colors.brand.primary : theme.colors.border.default,
        backgroundColor: selected ? theme.colors.brand.primary : theme.colors.background.surface,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <AppText variant="label" color={selected ? theme.colors.text.onBrand : theme.colors.text.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}
