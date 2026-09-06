import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

/** Every list/data screen's "nothing here yet" state — always paired with a next-step CTA (spec §26). */
export function EmptyState({ title, description, icon, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="text"
      style={{ alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl }}
    >
      {icon}
      <AppText variant="titleMd" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: theme.spacing.xs }} />
      ) : null}
    </View>
  );
}
