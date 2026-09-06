import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface BadgeProps {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  /** Overrides the tone-derived background — e.g. an `accent.*` token. */
  color?: string;
}

export function Badge({ label, tone = 'neutral', color } : BadgeProps) {
  const theme = useTheme();

  const bg =
    color ??
    (tone === 'neutral'
      ? theme.colors.background.surface
      : { success: theme.colors.status.success, warning: theme.colors.status.warning, error: theme.colors.status.error, info: theme.colors.status.info }[tone]);

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radius.pill,
        backgroundColor: bg,
      }}
    >
      <AppText variant="caption" color={color || tone !== 'neutral' ? theme.colors.text.onBrand : theme.colors.text.secondary}>
        {label}
      </AppText>
    </View>
  );
}
