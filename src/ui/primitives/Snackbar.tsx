import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

export interface SnackbarProps {
  message: string;
  tone?: 'neutral' | 'error' | 'success';
  actionLabel?: string;
  onAction?: () => void;
}

/** Presentational bar — rendered by the Toast system (see Toast.tsx) or inline in a screen. */
export function Snackbar({ message, tone = 'neutral', actionLabel, onAction }: SnackbarProps) {
  const theme = useTheme();

  const bg =
    tone === 'error'
      ? theme.colors.status.error
      : tone === 'success'
        ? theme.colors.status.success
        : theme.colors.brand.primaryDark;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
        backgroundColor: bg,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        ...theme.shadows.md,
      }}
    >
      <AppText variant="body" color={theme.colors.text.onBrand} style={{ flex: 1 }}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} variant="ghost" size="md" onPress={onAction} /> : null}
    </View>
  );
}
