import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface LoadingStateProps {
  message?: string;
}

/** Full-screen loader (ScreenLoader) — used sparingly; prefer Skeletons for list/data screens. */
export function LoadingState({ message }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm }}
    >
      <ActivityIndicator color={theme.colors.brand.primary} size="large" />
      {message ? (
        <AppText variant="body" color={theme.colors.text.secondary}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
