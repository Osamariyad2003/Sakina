import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, onPress, style, elevation = 'sm' }: CardProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          ...theme.shadows[elevation],
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      {content}
    </Pressable>
  );
}
