import React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import { useEffect } from 'react';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface ErrorStateProps {
  /** Human-readable Arabic message — never raw HTTP/stack details (spec §27). */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ message, onRetry, retryLabel = 'إعادة المحاولة' }: ErrorStateProps) {
  const theme = useTheme();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    <View
      accessibilityRole="alert"
      style={{ alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl }}
    >
      <AppText variant="body" color={theme.colors.status.error} style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      {onRetry ? <Button label={retryLabel} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
